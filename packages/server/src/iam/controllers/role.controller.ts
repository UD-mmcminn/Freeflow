import { Request, Response } from 'express'

export interface IRoleController {
    listRoles(req: Request, res: Response): Promise<Response>
    getRole(req: Request, res: Response): Promise<Response>
    createRole(req: Request, res: Response): Promise<Response>
    updateRole(req: Request, res: Response): Promise<Response>
    deleteRole(req: Request, res: Response): Promise<Response>
}

export class RoleController implements IRoleController {
    async listRoles(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async getRole(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async createRole(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateRole(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async deleteRole(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default RoleController
