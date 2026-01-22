import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import WorkspaceUserService from '../services/workspace-user.service'

export interface IWorkspaceUserController {
    listWorkspaceUsers(req: Request, res: Response): Promise<Response>
    getWorkspaceUser(req: Request, res: Response): Promise<Response>
    createWorkspaceUser(req: Request, res: Response): Promise<Response>
    updateWorkspaceUser(req: Request, res: Response): Promise<Response>
    deleteWorkspaceUser(req: Request, res: Response): Promise<Response>
}

export class WorkspaceUserController implements IWorkspaceUserController {
    private workspaceUserService: WorkspaceUserService

    constructor(workspaceUserService: WorkspaceUserService = new WorkspaceUserService()) {
        this.workspaceUserService = workspaceUserService
    }

    async listWorkspaceUsers(req: Request, res: Response): Promise<Response> {
        const userId = req.query?.userId as string | undefined
        const workspaceId = req.query?.workspaceId as string | undefined
        const organizationId = req.query?.organizationId as string | undefined
        const roleId = req.query?.roleId as string | undefined

        let results = []
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

        const mapped = results.map((item) => ({
            ...item,
            role: item.role ?? { name: 'Member' }
        }))
        return res.status(StatusCodes.OK).json(mapped)
    }

    async getWorkspaceUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async createWorkspaceUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateWorkspaceUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async deleteWorkspaceUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default WorkspaceUserController
