export enum WorkspaceUserErrorMessage {
    WORKSPACE_USER_NOT_FOUND = 'Workspace user not found'
}
export class WorkspaceUserService {
    async readWorkspaceUserByUserId(_userId: string, _queryRunner?: any): Promise<any[]> {
        return []
    }

    async listWorkspaceUsers(_workspaceId?: string): Promise<any[]> {
        return []
    }

    async getWorkspaceUserById(_workspaceUserId: string): Promise<any | null> {
        return null
    }

    async createWorkspaceUser(_payload: any): Promise<any> {
        return null
    }

    async updateWorkspaceUser(_workspaceUserId: string, _payload: any): Promise<any> {
        return null
    }

    async deleteWorkspaceUser(_workspaceUserId: string): Promise<void> {
        return
    }
}
export default WorkspaceUserService
