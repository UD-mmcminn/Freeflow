import { Request, Response } from 'express'

export interface IOrganizationUserController {
    listOrganizationUsers(req: Request, res: Response): Promise<Response>
    getOrganizationUser(req: Request, res: Response): Promise<Response>
    createOrganizationUser(req: Request, res: Response): Promise<Response>
    updateOrganizationUser(req: Request, res: Response): Promise<Response>
    deleteOrganizationUser(req: Request, res: Response): Promise<Response>
}

export class OrganizationUserController implements IOrganizationUserController {
    async listOrganizationUsers(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async getOrganizationUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async createOrganizationUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateOrganizationUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async deleteOrganizationUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default OrganizationUserController
