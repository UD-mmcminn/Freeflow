import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'

export enum WorkspaceUserErrorMessage {
    WORKSPACE_USER_NOT_FOUND = 'Workspace user not found'
}
export interface IWorkspaceUserService {
    readWorkspaceUserByUserId(userId: string, queryRunner?: any): Promise<any[]>
    listWorkspaceUsers(workspaceId?: string): Promise<any[]>
    getWorkspaceUserById(workspaceUserId: string): Promise<any | null>
    createWorkspaceUser(payload: any): Promise<any>
    updateWorkspaceUser(workspaceUserId: string | undefined, payload: any): Promise<any>
    deleteWorkspaceUser(workspaceUserId?: string, workspaceId?: string, userId?: string): Promise<void>
}

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

    async getWorkspaceUserById(workspaceUserId: string): Promise<WorkspaceUser | null> {
        if (!workspaceUserId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace user id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceUser)
            return repository.findOne({
                where: { id: workspaceUserId },
                relations: ['workspace', 'user', 'role']
            })
        })
    }

    async createWorkspaceUser(payload: any): Promise<WorkspaceUser> {
        const workspaceId = payload?.workspaceId
        const userId = payload?.userId
        if (!workspaceId || !userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace id and user id are required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceUser)
            const existing = await repository.findOneBy({ workspaceId, userId })
            if (existing) {
                const updated = repository.merge(existing, {
                    roleId: payload?.roleId ?? existing.roleId,
                    status: payload?.status ?? existing.status
                })
                return repository.save(updated)
            }
            const created = repository.create({
                workspaceId,
                userId,
                roleId: payload?.roleId,
                status: payload?.status ?? 'ACTIVE'
            })
            return repository.save(created)
        })
    }

    async updateWorkspaceUser(workspaceUserId: string | undefined, payload: any): Promise<WorkspaceUser> {
        const lookupId = workspaceUserId ?? payload?.id
        const workspaceId = payload?.workspaceId
        const userId = payload?.userId
        if (!lookupId && (!workspaceId || !userId)) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace user id or workspace/user id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceUser)
            const workspaceUser = lookupId
                ? await repository.findOneBy({ id: lookupId })
                : await repository.findOneBy({ workspaceId, userId })
            if (!workspaceUser) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, WorkspaceUserErrorMessage.WORKSPACE_USER_NOT_FOUND)
            }
            const updated = repository.merge(workspaceUser, {
                roleId: payload?.roleId ?? workspaceUser.roleId,
                status: payload?.status ?? workspaceUser.status
            })
            return repository.save(updated)
        })
    }

    async deleteWorkspaceUser(workspaceUserId?: string, workspaceId?: string, userId?: string): Promise<void> {
        if (!workspaceUserId && (!workspaceId || !userId)) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace user id or workspace/user id is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceUser)
            const workspaceUser = workspaceUserId
                ? await repository.findOneBy({ id: workspaceUserId })
                : await repository.findOneBy({ workspaceId, userId })
            if (!workspaceUser) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, WorkspaceUserErrorMessage.WORKSPACE_USER_NOT_FOUND)
            }
            workspaceUser.status = 'DISABLED'
            await repository.save(workspaceUser)
        })
    }
}
export default WorkspaceUserService
