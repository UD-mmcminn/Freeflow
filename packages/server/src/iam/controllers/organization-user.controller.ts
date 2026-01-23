import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { In } from 'typeorm'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { OrganizationUser } from '../database/entities/organization-user.entity'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'
import OrganizationUserService from '../services/organization-user.service'

export interface IOrganizationUserController {
    listOrganizationUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    getOrganizationUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    createOrganizationUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    updateOrganizationUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    deleteOrganizationUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class OrganizationUserController implements IOrganizationUserController {
    private organizationUserService: OrganizationUserService

    constructor(organizationUserService: OrganizationUserService = new OrganizationUserService()) {
        this.organizationUserService = organizationUserService
    }

    async listOrganizationUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const organizationId = req.query?.organizationId as string | undefined
            const userId = req.query?.userId as string | undefined
            const results = await this.organizationUserService.listOrganizationUsers({ organizationId, userId })
            const mapped = await this.mapOrganizationUsers(results)
            return res.status(StatusCodes.OK).json(mapped)
        } catch (error) {
            next(error)
        }
    }

    async getOrganizationUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const organizationId = req.query?.organizationId as string | undefined
            const userId = req.query?.userId as string | undefined
            if (!organizationId || !userId) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Organization id and user id are required' })
            }
            const results = await this.organizationUserService.listOrganizationUsers({ organizationId, userId })
            const mapped = await this.mapOrganizationUsers(results)
            return res.status(StatusCodes.OK).json(mapped)
        } catch (error) {
            next(error)
        }
    }

    async createOrganizationUser(_req: Request, res: Response, _next: NextFunction): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateOrganizationUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = req.body ?? {}
            const updated = await this.organizationUserService.updateOrganizationUser({
                organizationId: body.organizationId,
                userId: body.userId,
                status: body.status,
                roleId: body.roleId,
                isOwner: body.isOwner
            })
            return res.status(StatusCodes.OK).json(updated)
        } catch (error) {
            next(error)
        }
    }

    async deleteOrganizationUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const organizationId = req.query?.organizationId as string | undefined
            const userId = req.query?.userId as string | undefined
            if (!organizationId || !userId) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Organization id and user id are required' })
            }
            await this.organizationUserService.deleteOrganizationUser(organizationId, userId)
            return res.status(StatusCodes.OK).json({ message: 'Organization user deleted' })
        } catch (error) {
            next(error)
        }
    }

    private async mapOrganizationUsers(users: OrganizationUser[]): Promise<any[]> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            if (users.length === 0) {
                return []
            }
            const workspaceUserRepository = manager.getRepository(WorkspaceUser)
            const userIds = users.map((item) => item.userId)
            const workspaceUsers = await workspaceUserRepository.find({
                where: userIds.length ? { userId: In(userIds) } : undefined,
                relations: ['workspace', 'role']
            })
            return users.map((orgUser) => {
                const user = orgUser.user
                const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
                const displayStatus = this.normalizeStatus(orgUser.status)
                const assignedRoles = workspaceUsers.filter(
                    (entry) => entry.userId === orgUser.userId && entry.workspace?.organizationId === orgUser.organizationId
                )
                return {
                    id: orgUser.id,
                    organizationId: orgUser.organizationId,
                    userId: orgUser.userId,
                    status: displayStatus,
                    isOrgOwner: orgUser.isOwner ?? false,
                    roleCount: assignedRoles.length,
                    lastLogin: null,
                    user: {
                        id: user?.id ?? orgUser.userId,
                        email: user?.email,
                        name: name || user?.email,
                        status: user?.status
                    }
                }
            })
        })
    }

    private normalizeStatus(status: OrganizationUser['status']): string {
        if (status === 'DISABLED') return 'INACTIVE'
        if (status === 'PENDING') return 'INVITED'
        return status
    }

}

export default OrganizationUserController
