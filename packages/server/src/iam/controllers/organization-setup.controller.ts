import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { LoggedInUser } from '../Interface.Iam'
import OrganizationSetupService from '../services/organization-setup.service'
import { OrganizationSetupRequestBody } from '../types/organization.requests'
import { AccountResponse } from '../types/account.responses'

export interface IOrganizationSetupController {
    setupOrganization(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class OrganizationSetupController implements IOrganizationSetupController {
    private organizationSetupService: OrganizationSetupService

    constructor(organizationSetupService: OrganizationSetupService = new OrganizationSetupService()) {
        this.organizationSetupService = organizationSetupService
    }

    async setupOrganization(
        req: Request,
        res: Response<AccountResponse>,
        next: NextFunction
    ): Promise<Response<AccountResponse> | void> {
        try {
            const body = req.body as OrganizationSetupRequestBody
            if (!body?.organization?.name) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization name is required')
            }

            const actor = req.user as LoggedInUser | undefined
            const normalizedUser = actor
                ? {
                      id: actor.id,
                      email: actor.email,
                      firstName: actor.firstName,
                      lastName: actor.lastName
                  }
                : this.normalizeUser(body.user)

            const result = await this.organizationSetupService.setupOrganization({
                organization: body.organization,
                user: normalizedUser,
                workspace: body.workspace,
                role: body.role
            })

            return res.status(StatusCodes.CREATED).json({ account: result, message: 'Organization setup' })
        } catch (error) {
            next(error)
        }
    }

    private normalizeUser(user?: OrganizationSetupRequestBody['user']) {
        if (!user) {
            return undefined
        }
        if (user.firstName || user.lastName) {
            return user
        }
        const name = user.name?.trim()
        if (!name) {
            return user
        }
        const parts = name.split(/\s+/)
        return {
            ...user,
            firstName: parts[0],
            lastName: parts.slice(1).join(' ') || undefined
        }
    }
}

export default OrganizationSetupController
