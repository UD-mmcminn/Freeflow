export interface IRoleService {
    listRoles(organizationId?: string): Promise<any[]>
    getRoleById(roleId: string): Promise<any | null>
    createRole(payload: any): Promise<any>
    updateRole(roleId: string, payload: any): Promise<any>
    deleteRole(roleId: string): Promise<void>
}

export class RoleService implements IRoleService {
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
