export class WorkspaceSharedService {
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
