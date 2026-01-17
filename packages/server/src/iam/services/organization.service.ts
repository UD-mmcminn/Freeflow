import { Organization } from '../database/entities/organization.entity'

export class OrganizationService {
    async readOrganization(_queryRunner?: any): Promise<Organization[]> {
        return []
    }
}
export default OrganizationService
