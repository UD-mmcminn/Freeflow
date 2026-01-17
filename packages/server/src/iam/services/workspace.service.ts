export class WorkspaceService {
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
