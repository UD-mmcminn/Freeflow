export interface IWorkspaceService {
    getSharedItemsForWorkspace(workspaceId: string, itemType: string): Promise<any[]>
    listWorkspaces(): Promise<any[]>
    getWorkspaceById(workspaceId: string): Promise<any | null>
    createWorkspace(payload: any): Promise<any>
    updateWorkspace(workspaceId: string, payload: any): Promise<any>
    deleteWorkspace(workspaceId: string): Promise<void>
}

export class WorkspaceService implements IWorkspaceService {
    async getSharedItemsForWorkspace(_workspaceId: string, _itemType: string): Promise<any[]> {
        return []
    }

    async listWorkspaces(): Promise<any[]> {
        return []
    }

    async getWorkspaceById(_workspaceId: string): Promise<any | null> {
        return null
    }

    async createWorkspace(_payload: any): Promise<any> {
        return null
    }

    async updateWorkspace(_workspaceId: string, _payload: any): Promise<any> {
        return null
    }

    async deleteWorkspace(_workspaceId: string): Promise<void> {
        return
    }
}
export default WorkspaceService
