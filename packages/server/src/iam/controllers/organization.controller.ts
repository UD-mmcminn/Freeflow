import { Request, Response } from 'express'

export interface IOrganizationController {
    listOrganizations(req: Request, res: Response): Promise<Response>
    getOrganization(req: Request, res: Response): Promise<Response>
    createOrganization(req: Request, res: Response): Promise<Response>
    updateOrganization(req: Request, res: Response): Promise<Response>
    deleteOrganization(req: Request, res: Response): Promise<Response>
}

export class OrganizationController implements IOrganizationController {
    async listOrganizations(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async getOrganization(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async createOrganization(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateOrganization(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async deleteOrganization(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default OrganizationController
