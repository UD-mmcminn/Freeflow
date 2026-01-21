import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import OrganizationUserService from '../services/organization-user.service'

export interface IOrganizationUserController {
    listOrganizationUsers(req: Request, res: Response): Promise<Response>
    getOrganizationUser(req: Request, res: Response): Promise<Response>
    createOrganizationUser(req: Request, res: Response): Promise<Response>
    updateOrganizationUser(req: Request, res: Response): Promise<Response>
    deleteOrganizationUser(req: Request, res: Response): Promise<Response>
}

export class OrganizationUserController implements IOrganizationUserController {
    private organizationUserService: OrganizationUserService

    constructor(organizationUserService: OrganizationUserService = new OrganizationUserService()) {
        this.organizationUserService = organizationUserService
    }

    async listOrganizationUsers(req: Request, res: Response): Promise<Response> {
        const organizationId = req.query?.organizationId as string | undefined
        const userId = req.query?.userId as string | undefined
        const results = await this.organizationUserService.listOrganizationUsers({ organizationId, userId })
        return res.status(StatusCodes.OK).json(results)
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
