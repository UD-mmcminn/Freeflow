import { Request, Response } from 'express'

export interface IWorkspaceUserController {
    listWorkspaceUsers(req: Request, res: Response): Promise<Response>
    getWorkspaceUser(req: Request, res: Response): Promise<Response>
    createWorkspaceUser(req: Request, res: Response): Promise<Response>
    updateWorkspaceUser(req: Request, res: Response): Promise<Response>
    deleteWorkspaceUser(req: Request, res: Response): Promise<Response>
}

export class WorkspaceUserController implements IWorkspaceUserController {
    async listWorkspaceUsers(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
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
