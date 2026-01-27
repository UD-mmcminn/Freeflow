import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import OrganizationService from '../services/organization.service'

export interface IOrganizationController {
    listOrganizations(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    getOrganization(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    createOrganization(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    updateOrganization(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    deleteOrganization(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class OrganizationController implements IOrganizationController {
    private organizationService: OrganizationService

    constructor(organizationService: OrganizationService = new OrganizationService()) {
        this.organizationService = organizationService
    }

    async listOrganizations(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
            next(error)
        }
    }

    async getOrganization(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
            next(error)
        }
    }

    async createOrganization(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.organizationService.createOrganization(req.body)
            return res.status(StatusCodes.CREATED).json({ organization: result.organization })
        } catch (error) {
            next(error)
        }
    }

    async updateOrganization(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const organizationId = (req.body?.id as string | undefined) ?? (req.query?.id as string | undefined)
            if (!organizationId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
            }
            const organization = await this.organizationService.updateOrganization(organizationId, req.body)
            return res.status(StatusCodes.OK).json({ organization })
        } catch (error) {
            next(error)
        }
    }

    async deleteOrganization(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const organizationId = (req.query?.id as string | undefined) ?? (req.body?.id as string | undefined)
            if (!organizationId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
            }
            await this.organizationService.deleteOrganization(organizationId)
            return res.status(StatusCodes.OK).json({ message: 'Organization deleted' })
        } catch (error) {
            next(error)
        }
    }
}

export default OrganizationController
