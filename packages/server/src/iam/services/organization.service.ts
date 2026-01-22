import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Organization } from '../database/entities/organization.entity'

export interface IOrganizationService {
    readOrganization(queryRunner?: any): Promise<Organization[]>
    listOrganizations(): Promise<Organization[]>
    getOrganizationById(organizationId: string): Promise<Organization | null>
    createOrganization(payload: any): Promise<Organization | null>
    updateOrganization(organizationId: string, payload: any): Promise<Organization | null>
    deleteOrganization(organizationId: string): Promise<void>
}

export class OrganizationService implements IOrganizationService {
    async readOrganization(queryRunner?: any): Promise<Organization[]> {
        if (queryRunner) {
            return queryRunner.manager.getRepository(Organization).find()
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            return manager.getRepository(Organization).find()
        })
    }

    async listOrganizations(): Promise<Organization[]> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            return manager.getRepository(Organization).find()
        })
    }

    async getOrganizationById(organizationId: string): Promise<Organization | null> {
        if (!organizationId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            return manager.getRepository(Organization).findOneBy({ id: organizationId })
        })
    }

    async createOrganization(payload: any): Promise<Organization | null> {
        const name = payload?.name?.trim()
        if (!name) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization name is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Organization)
            const organization = repository.create({
                name,
                subscriptionId: payload?.subscriptionId,
                customerId: payload?.customerId,
                productId: payload?.productId
            })
            return repository.save(organization)
        })
    }

    async updateOrganization(organizationId: string, payload: any): Promise<Organization | null> {
        if (!organizationId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Organization)
            const organization = await repository.findOneBy({ id: organizationId })
            if (!organization) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Organization not found')
            }
            const updated = repository.merge(organization, {
                name: payload?.name ?? organization.name,
                subscriptionId: payload?.subscriptionId ?? organization.subscriptionId,
                customerId: payload?.customerId ?? organization.customerId,
                productId: payload?.productId ?? organization.productId
            })
            return repository.save(updated)
        })
    }

    async deleteOrganization(organizationId: string): Promise<void> {
        if (!organizationId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Organization)
            await repository.delete({ id: organizationId })
        })
    }
}
export default OrganizationService
