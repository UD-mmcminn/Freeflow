export interface IWorkspaceSharedService {
    listWorkspaceSharedItems(workspaceId?: string): Promise<any[]>
    getWorkspaceSharedById(workspaceSharedId: string): Promise<any | null>
    createWorkspaceShared(payload: any): Promise<any>
    deleteWorkspaceShared(workspaceSharedId: string): Promise<void>
}

export class WorkspaceSharedService implements IWorkspaceSharedService {
    async listWorkspaceSharedItems(_workspaceId?: string): Promise<any[]> {
        return []
    }

    async getWorkspaceSharedById(_workspaceSharedId: string): Promise<any | null> {
        return null
    }

    async createWorkspaceShared(_payload: any): Promise<any> {
        return null
    }

    async deleteWorkspaceShared(_workspaceSharedId: string): Promise<void> {
        return
    }
}
export default WorkspaceSharedService
