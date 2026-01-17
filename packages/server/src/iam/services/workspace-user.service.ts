export enum WorkspaceUserErrorMessage {
    WORKSPACE_USER_NOT_FOUND = 'Workspace user not found'
}
export interface IWorkspaceUserService {
    readWorkspaceUserByUserId(userId: string, queryRunner?: any): Promise<any[]>
    listWorkspaceUsers(workspaceId?: string): Promise<any[]>
    getWorkspaceUserById(workspaceUserId: string): Promise<any | null>
    createWorkspaceUser(payload: any): Promise<any>
    updateWorkspaceUser(workspaceUserId: string, payload: any): Promise<any>
    deleteWorkspaceUser(workspaceUserId: string): Promise<void>
}

export class WorkspaceUserService implements IWorkspaceUserService {
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
