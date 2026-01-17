import { Request, Response } from 'express'

export interface IWorkspaceController {
    listWorkspaces(req: Request, res: Response): Promise<Response>
    getWorkspace(req: Request, res: Response): Promise<Response>
    createWorkspace(req: Request, res: Response): Promise<Response>
    updateWorkspace(req: Request, res: Response): Promise<Response>
    deleteWorkspace(req: Request, res: Response): Promise<Response>
}

export class WorkspaceController implements IWorkspaceController {
    async listWorkspaces(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async getWorkspace(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async createWorkspace(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateWorkspace(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async deleteWorkspace(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default WorkspaceController
