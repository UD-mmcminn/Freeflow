import { Request, Response } from 'express'

export interface IWorkspaceSharedController {
    listWorkspaceShared(req: Request, res: Response): Promise<Response>
    getWorkspaceShared(req: Request, res: Response): Promise<Response>
    createWorkspaceShared(req: Request, res: Response): Promise<Response>
    deleteWorkspaceShared(req: Request, res: Response): Promise<Response>
}

export class WorkspaceSharedController implements IWorkspaceSharedController {
    async listWorkspaceShared(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async getWorkspaceShared(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async createWorkspaceShared(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async deleteWorkspaceShared(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default WorkspaceSharedController
