import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { OrganizationUser } from '../database/entities/organization-user.entity'

export interface IOrganizationUserService {
    listOrganizationUsers(filters?: { organizationId?: string; userId?: string }): Promise<OrganizationUser[]>
    getOrganizationUserById(organizationUserId: string): Promise<OrganizationUser | null>
    createOrganizationUser(payload: any): Promise<OrganizationUser>
    updateOrganizationUser(organizationUserId: string, payload: any): Promise<OrganizationUser | null>
    deleteOrganizationUser(organizationUserId: string): Promise<void>
}

export class OrganizationUserService implements IOrganizationUserService {
    async listOrganizationUsers(filters?: { organizationId?: string; userId?: string }): Promise<OrganizationUser[]> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(OrganizationUser)
            const where: { organizationId?: string; userId?: string } = {}
            if (filters?.organizationId) where.organizationId = filters.organizationId
            if (filters?.userId) where.userId = filters.userId
            return repository.find({
                where: Object.keys(where).length ? where : undefined,
                relations: ['organization', 'user', 'role']
            })
        })
    }

    async getOrganizationUserById(_organizationUserId: string): Promise<OrganizationUser | null> {
        return null
    }

    async createOrganizationUser(_payload: any): Promise<OrganizationUser> {
        return null as unknown as OrganizationUser
    }

    async updateOrganizationUser(_organizationUserId: string, _payload: any): Promise<OrganizationUser | null> {
        return null
    }

    async deleteOrganizationUser(_organizationUserId: string): Promise<void> {
        return
    }
}
export default OrganizationUserService
