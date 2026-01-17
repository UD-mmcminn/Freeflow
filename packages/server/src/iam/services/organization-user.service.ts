export interface IOrganizationUserService {
    listOrganizationUsers(organizationId?: string): Promise<any[]>
    getOrganizationUserById(organizationUserId: string): Promise<any | null>
    createOrganizationUser(payload: any): Promise<any>
    updateOrganizationUser(organizationUserId: string, payload: any): Promise<any>
    deleteOrganizationUser(organizationUserId: string): Promise<void>
}

export class OrganizationUserService implements IOrganizationUserService {
    async listOrganizationUsers(_organizationId?: string): Promise<any[]> {
        return []
    }

    async getOrganizationUserById(_organizationUserId: string): Promise<any | null> {
        return null
    }

    async createOrganizationUser(_payload: any): Promise<any> {
        return null
    }

    async updateOrganizationUser(_organizationUserId: string, _payload: any): Promise<any> {
        return null
    }

    async deleteOrganizationUser(_organizationUserId: string): Promise<void> {
        return
    }
}
export default OrganizationUserService
