import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../middleware/passport/auth.tokens'
import { setAuthCookies } from '../middleware/passport/auth.cookies'
import getAuthConfig from '../middleware/passport/auth.config'
import { LoggedInUser } from '../Interface.Iam'
import { Organization } from '../database/entities/organization.entity'
import { Workspace } from '../database/entities/workspace.entity'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'
import LoginSessionService from '../services/login-session.service'
import WorkspaceService from '../services/workspace.service'
import WorkspaceSharedService from '../services/workspace-shared.service'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

export interface IWorkspaceController {
    listWorkspaces(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    getWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    createWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    updateWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    deleteWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    switchWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class WorkspaceController implements IWorkspaceController {
    private workspaceService: WorkspaceService
    private workspaceSharedService: WorkspaceSharedService

    constructor(
        workspaceService: WorkspaceService = new WorkspaceService(),
        workspaceSharedService: WorkspaceSharedService = new WorkspaceSharedService()
    ) {
        this.workspaceService = workspaceService
        this.workspaceSharedService = workspaceSharedService
    }

    async listWorkspaces(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const workspaceId = (req.query?.id as string | undefined) ?? (req.query?.workspaceId as string | undefined)
            if (workspaceId) {
                const workspace = await this.workspaceService.getWorkspaceById(workspaceId)
                if (!workspace) {
                    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Workspace not found' })
                }
                return res.status(StatusCodes.OK).json(workspace)
            }
            const organizationId = req.query?.organizationId as string | undefined
            const workspaces = await this.workspaceService.listWorkspaces(organizationId)
            return res.status(StatusCodes.OK).json(workspaces)
        } catch (error) {
            next(error)
        }
    }

    async getWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const workspaceId = (req.params?.workspaceId as string | undefined) ?? (req.query?.id as string | undefined)
            if (!workspaceId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace id is required')
            }
            const workspace = await this.workspaceService.getWorkspaceById(workspaceId)
            if (!workspace) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Workspace not found' })
            }
            return res.status(StatusCodes.OK).json(workspace)
        } catch (error) {
            next(error)
        }
    }

    async createWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const workspace = await this.workspaceService.createWorkspace(req.body ?? {})
            return res.status(StatusCodes.CREATED).json(workspace)
        } catch (error) {
            next(error)
        }
    }

    async updateWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const workspaceId = (req.body?.id as string | undefined) ?? (req.query?.id as string | undefined)
            if (!workspaceId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace id is required')
            }
            const workspace = await this.workspaceService.updateWorkspace(workspaceId, req.body ?? {})
            return res.status(StatusCodes.OK).json(workspace)
        } catch (error) {
            next(error)
        }
    }

    async deleteWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const workspaceId = (req.params?.workspaceId as string | undefined) ?? (req.query?.id as string | undefined)
            if (!workspaceId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace id is required')
            }
            await this.workspaceService.deleteWorkspace(workspaceId)
            return res.status(StatusCodes.OK).json({ message: 'Workspace deleted' })
        } catch (error) {
            next(error)
        }
    }

    async switchWorkspace(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const workspaceId = (req.query?.id as string | undefined) ?? (req.body?.id as string | undefined)
            if (!workspaceId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace id is required')
            }
            const sessionUser = req.user as LoggedInUser | undefined
            if (!sessionUser?.id) {
                throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
            }
            const refreshCookieName = getAuthConfig().cookies.refreshTokenName
            const refreshToken = req.cookies?.[refreshCookieName]
            if (!refreshToken) {
                throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Refresh token is required')
            }
            verifyRefreshToken(refreshToken)

            const appServer = getRunningExpressApp()
            const result = await appServer.AppDataSource.transaction(async (manager) => {
                const workspaceRepository = manager.getRepository(Workspace)
                const workspaceUserRepository = manager.getRepository(WorkspaceUser)
                const organizationRepository = manager.getRepository(Organization)

                const workspaceUser = await workspaceUserRepository.findOne({
                    where: { workspaceId, userId: sessionUser.id },
                    relations: ['workspace', 'role']
                })
                if (!workspaceUser || workspaceUser.status === 'DISABLED') {
                    throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Workspace access denied')
                }

                const workspace = workspaceUser.workspace ?? (await workspaceRepository.findOneBy({ id: workspaceId }))
                if (!workspace) {
                    throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Workspace not found')
                }

                const organization = await organizationRepository.findOneBy({ id: workspace.organizationId })

                const identityManager = appServer.identityManager
                const subscriptionId = organization?.subscriptionId ?? ''
                const features = identityManager ? await identityManager.getFeaturesByPlan(subscriptionId) : {}
                const permissions = this.parsePermissions(workspaceUser.role?.permissions)
                const roles = workspaceUser.role?.name ? [workspaceUser.role.name] : []

                const updatedUser: LoggedInUser = {
                    ...sessionUser,
                    permissions,
                    roles,
                    activeOrganizationId: workspace.organizationId,
                    activeOrganizationSubscriptionId: organization?.subscriptionId,
                    activeOrganizationCustomerId: organization?.customerId,
                    activeOrganizationProductId: organization?.productId,
                    activeWorkspaceId: workspace.id,
                    activeWorkspace: workspace.name,
                    activeWorkspaceRole: workspaceUser.role?.name,
                    features
                }

                if (req.session) {
                    const session = req.session as any
                    session.passport = session.passport ?? {}
                    session.passport.user = updatedUser
                }
                req.user = updatedUser

                const sessionService = new LoginSessionService()
                const session = await sessionService.getSessionByRefreshToken(refreshToken, manager)
                if (!session) {
                    throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Session not found')
                }
                const tokenPayload = {
                    userId: sessionUser.id,
                    orgId: updatedUser.activeOrganizationId,
                    workspaceId: updatedUser.activeWorkspaceId
                }
                const accessToken = signAccessToken(tokenPayload)
                const nextRefreshToken = signRefreshToken(tokenPayload)
                await sessionService.rotateSessionTokens(
                    session,
                    {
                        sessionToken: session.sessionToken,
                        refreshToken: nextRefreshToken,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    },
                    manager
                )

                const allWorkspaceUsers = await workspaceUserRepository.find({
                    where: { userId: sessionUser.id },
                    relations: ['workspace']
                })
                const assignedWorkspaces = allWorkspaceUsers
                    .filter((entry) => entry.status !== 'DISABLED')
                    .map((entry) => ({
                        id: entry.workspaceId,
                        name: entry.workspace?.name ?? ''
                    }))

                setAuthCookies(res, accessToken, nextRefreshToken)

                const fullName = [updatedUser.firstName, updatedUser.lastName].filter(Boolean).join(' ').trim()

                return {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: fullName || updatedUser.email,
                    status: 'ACTIVE',
                    role: null,
                    isSSO: false,
                    activeOrganizationId: updatedUser.activeOrganizationId,
                    activeOrganizationSubscriptionId: updatedUser.activeOrganizationSubscriptionId,
                    activeOrganizationCustomerId: updatedUser.activeOrganizationCustomerId,
                    activeOrganizationProductId: updatedUser.activeOrganizationProductId,
                    activeWorkspaceId: updatedUser.activeWorkspaceId,
                    activeWorkspace: updatedUser.activeWorkspace,
                    lastLogin: null,
                    isOrganizationAdmin: updatedUser.isOrganizationAdmin ?? false,
                    assignedWorkspaces,
                    permissions: updatedUser.permissions ?? [],
                    features: updatedUser.features ?? {},
                    token: session.sessionToken
                }
            })

            if (req.session?.save) {
                req.session.save(() => undefined)
            }

            return res.status(StatusCodes.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    async listWorkspaceShares(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const sharedItemId = req.params?.sharedItemId as string | undefined
            if (!sharedItemId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Shared item id is required')
            }
            const shared = await this.workspaceSharedService.listWorkspaceSharedItems({
                sharedItemId
            })
            return res.status(StatusCodes.OK).json(shared)
        } catch (error) {
            next(error)
        }
    }

    async setWorkspaceShares(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const sharedItemId = req.params?.sharedItemId as string | undefined
            const itemType = req.body?.itemType
            const workspaceIds = req.body?.workspaceIds ?? []
            if (!sharedItemId || !itemType) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Shared item id and type are required')
            }
            const updated = await this.workspaceSharedService.replaceSharedWorkspacesForItem({
                sharedItemId,
                itemType,
                workspaceIds
            })
            return res.status(StatusCodes.OK).json(updated)
        } catch (error) {
            next(error)
        }
    }

    private parsePermissions(raw: string | undefined): string[] {
        if (!raw) {
            return []
        }
        try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }
}

export default WorkspaceController
