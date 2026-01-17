export class RoleService {
    async listRoles(_organizationId?: string): Promise<any[]> {
        return []
    }

    async getRoleById(_roleId: string): Promise<any | null> {
        return null
    }

    async createRole(_payload: any): Promise<any> {
        return null
    }

    async updateRole(_roleId: string, _payload: any): Promise<any> {
        return null
    }

    async deleteRole(_roleId: string): Promise<void> {
        return
    }
}
export default RoleService
