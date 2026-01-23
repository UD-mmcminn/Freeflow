import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { In } from 'typeorm'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { OrganizationUser } from '../database/entities/organization-user.entity'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'
import WorkspaceUserService from '../services/workspace-user.service'

export interface IWorkspaceUserController {
    listWorkspaceUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    getWorkspaceUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    createWorkspaceUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    updateWorkspaceUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    deleteWorkspaceUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class WorkspaceUserController implements IWorkspaceUserController {
    private workspaceUserService: WorkspaceUserService

    constructor(workspaceUserService: WorkspaceUserService = new WorkspaceUserService()) {
        this.workspaceUserService = workspaceUserService
    }

    async listWorkspaceUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.query?.userId as string | undefined
            const workspaceId = req.query?.workspaceId as string | undefined
            const organizationId = req.query?.organizationId as string | undefined
            const roleId = req.query?.roleId as string | undefined

            let results: WorkspaceUser[] = []
            if (userId) {
                results = await this.workspaceUserService.readWorkspaceUserByUserId(userId)
            } else {
                results = await this.workspaceUserService.listWorkspaceUsers(workspaceId)
            }

            if (workspaceId) {
                results = results.filter((item) => item.workspaceId === workspaceId)
            }
            if (organizationId) {
                results = results.filter((item) => item.workspace?.organizationId === organizationId)
            }
            if (roleId) {
                results = results.filter((item) => item.roleId === roleId)
            }

            const mapped = await this.mapWorkspaceUsers(results)
            return res.status(StatusCodes.OK).json(mapped)
        } catch (error) {
            next(error)
        }
    }

    async getWorkspaceUser(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const workspaceUserId = (_req.params?.workspaceUserId as string | undefined) ?? (_req.query?.id as string | undefined)
            if (!workspaceUserId) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Workspace user id is required' })
            }
            const workspaceUser = await this.workspaceUserService.getWorkspaceUserById(workspaceUserId)
            if (!workspaceUser) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Workspace user not found' })
            }
            const mapped = await this.mapWorkspaceUsers([workspaceUser])
            return res.status(StatusCodes.OK).json(mapped[0])
        } catch (error) {
            next(error)
        }
    }

    async createWorkspaceUser(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const created = await this.workspaceUserService.createWorkspaceUser(_req.body ?? {})
            const mapped = await this.mapWorkspaceUsers([created])
            return res.status(StatusCodes.CREATED).json(mapped[0])
        } catch (error) {
            next(error)
        }
    }

    async updateWorkspaceUser(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const updated = await this.workspaceUserService.updateWorkspaceUser(_req.body?.id, _req.body ?? {})
            const mapped = await this.mapWorkspaceUsers([updated])
            return res.status(StatusCodes.OK).json(mapped[0])
        } catch (error) {
            next(error)
        }
    }

    async deleteWorkspaceUser(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const workspaceUserId = _req.query?.id as string | undefined
            const workspaceId = _req.query?.workspaceId as string | undefined
            const userId = _req.query?.userId as string | undefined
            await this.workspaceUserService.deleteWorkspaceUser(workspaceUserId, workspaceId, userId)
            return res.status(StatusCodes.OK).json({ message: 'Workspace user deleted' })
        } catch (error) {
            next(error)
        }
    }

    private async mapWorkspaceUsers(users: WorkspaceUser[]): Promise<any[]> {
        if (users.length === 0) {
            return []
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const organizationUserRepository = manager.getRepository(OrganizationUser)
            const userIds = users.map((entry) => entry.userId)
            const organizationUsers = await organizationUserRepository.find({
                where: userIds.length ? { userId: In(userIds) } : undefined
            })
            const ownerByUserOrg = new Map<string, boolean>()
            for (const entry of organizationUsers) {
                ownerByUserOrg.set(`${entry.userId}:${entry.organizationId}`, entry.isOwner ?? false)
            }

            return users.map((item) => {
                const displayStatus = this.normalizeStatus(item.status)
                const organizationId = item.workspace?.organizationId
                const isOrgOwner = organizationId ? ownerByUserOrg.get(`${item.userId}:${organizationId}`) ?? false : false
                return {
                    ...item,
                    status: displayStatus,
                    isOrgOwner,
                    lastLogin: null,
                    role: item.role ?? { name: 'Member' }
                }
            })
        })
    }

    private normalizeStatus(status: WorkspaceUser['status']): string {
        if (status === 'DISABLED') return 'INACTIVE'
        if (status === 'PENDING') return 'INVITED'
        return status
    }

}

export default WorkspaceUserController
