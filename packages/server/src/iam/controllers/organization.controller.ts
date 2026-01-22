import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import OrganizationService from '../services/organization.service'

export interface IOrganizationController {
    listOrganizations(req: Request, res: Response): Promise<Response>
    getOrganization(req: Request, res: Response): Promise<Response>
    createOrganization(req: Request, res: Response): Promise<Response>
    updateOrganization(req: Request, res: Response): Promise<Response>
    deleteOrganization(req: Request, res: Response): Promise<Response>
}

export class OrganizationController implements IOrganizationController {
    private organizationService: OrganizationService

    constructor(organizationService: OrganizationService = new OrganizationService()) {
        this.organizationService = organizationService
    }

    async listOrganizations(req: Request, res: Response): Promise<Response> {
        try {
            const organizationId = (req.query?.organizationId as string | undefined) ?? (req.query?.id as string | undefined)
            if (organizationId) {
                const organization = await this.organizationService.getOrganizationById(organizationId)
                if (!organization) {
                    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Organization not found' })
                }
                return res.status(StatusCodes.OK).json({ organization })
            }
            const organizations = await this.organizationService.listOrganizations()
            return res.status(StatusCodes.OK).json({ organizations })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async getOrganization(req: Request, res: Response): Promise<Response> {
        try {
            const organizationId = (req.params?.organizationId as string | undefined) ?? (req.query?.id as string | undefined)
            if (!organizationId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
            }
            const organization = await this.organizationService.getOrganizationById(organizationId)
            if (!organization) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Organization not found' })
            }
            return res.status(StatusCodes.OK).json({ organization })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async createOrganization(req: Request, res: Response): Promise<Response> {
        try {
            const organization = await this.organizationService.createOrganization(req.body)
            return res.status(StatusCodes.CREATED).json({ organization })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async updateOrganization(req: Request, res: Response): Promise<Response> {
        try {
            const organizationId = (req.body?.id as string | undefined) ?? (req.query?.id as string | undefined)
            if (!organizationId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
            }
            const organization = await this.organizationService.updateOrganization(organizationId, req.body)
            return res.status(StatusCodes.OK).json({ organization })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async deleteOrganization(req: Request, res: Response): Promise<Response> {
        try {
            const organizationId = (req.query?.id as string | undefined) ?? (req.body?.id as string | undefined)
            if (!organizationId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
            }
            await this.organizationService.deleteOrganization(organizationId)
            return res.status(StatusCodes.OK).json({ message: 'Organization deleted' })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    private handleError(res: Response, error: unknown): Response {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ message: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' })
    }
}

export default OrganizationController
