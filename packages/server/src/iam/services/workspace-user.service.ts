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

import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'

export class WorkspaceUserService implements IWorkspaceUserService {
    async readWorkspaceUserByUserId(userId: string, queryRunner?: any): Promise<WorkspaceUser[]> {
        if (!userId) return []
        const appServer = getRunningExpressApp()
        if (queryRunner) {
            const repository = queryRunner.manager.getRepository(WorkspaceUser)
            return repository.find({ where: { userId }, relations: ['workspace', 'user', 'role'] })
        }
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceUser)
            return repository.find({ where: { userId }, relations: ['workspace', 'user', 'role'] })
        })
    }

    async listWorkspaceUsers(workspaceId?: string): Promise<WorkspaceUser[]> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceUser)
            return repository.find({
                where: workspaceId ? { workspaceId } : undefined,
                relations: ['workspace', 'user', 'role']
            })
        })
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
