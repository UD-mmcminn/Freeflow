import { Organization } from '../database/entities/organization.entity'

export class OrganizationService {
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
