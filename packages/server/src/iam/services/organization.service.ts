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
    async readOrganization(_queryRunner?: any): Promise<Organization[]> {
        return []
    }

    async listOrganizations(): Promise<Organization[]> {
        return []
    }

    async getOrganizationById(_organizationId: string): Promise<Organization | null> {
        return null
    }

    async createOrganization(_payload: any): Promise<Organization | null> {
        return null
    }

    async updateOrganization(_organizationId: string, _payload: any): Promise<Organization | null> {
        return null
    }

    async deleteOrganization(_organizationId: string): Promise<void> {
        return
    }
}
export default OrganizationService
