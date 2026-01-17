export enum WorkspaceUserErrorMessage {
    WORKSPACE_USER_NOT_FOUND = 'Workspace user not found'
}
export class WorkspaceUserService {
    async readWorkspaceUserByUserId(_userId: string, _queryRunner?: any): Promise<any[]> {
        return []
    }
}
export default WorkspaceUserService
