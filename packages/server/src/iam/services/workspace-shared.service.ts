import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { WorkspaceShared } from '../database/entities/workspace-shared.entity'

export interface IWorkspaceSharedService {
    listWorkspaceSharedItems(filters?: { workspaceId?: string; sharedItemId?: string; itemType?: string }): Promise<any[]>
    getWorkspaceSharedById(workspaceSharedId: string): Promise<any | null>
    createWorkspaceShared(payload: any): Promise<any>
    deleteWorkspaceShared(workspaceSharedId: string): Promise<void>
    replaceSharedWorkspacesForItem(payload: { sharedItemId: string; itemType: string; workspaceIds: string[] }): Promise<WorkspaceShared[]>
}

export class WorkspaceSharedService implements IWorkspaceSharedService {
    async listWorkspaceSharedItems(filters?: { workspaceId?: string; sharedItemId?: string; itemType?: string }): Promise<WorkspaceShared[]> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceShared)
            const where: Record<string, any> = {}
            if (filters?.workspaceId) {
                where.workspaceId = filters.workspaceId
            }
            if (filters?.sharedItemId) {
                where.sharedItemId = filters.sharedItemId
            }
            if (filters?.itemType) {
                where.itemType = filters.itemType
            }
            return repository.find({ where: Object.keys(where).length ? where : undefined })
        })
    }

    async getWorkspaceSharedById(workspaceSharedId: string): Promise<WorkspaceShared | null> {
        if (!workspaceSharedId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace shared id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceShared)
            return repository.findOneBy({ id: workspaceSharedId })
        })
    }

    async createWorkspaceShared(payload: any): Promise<WorkspaceShared> {
        if (!payload?.workspaceId || !payload?.sharedItemId || !payload?.itemType) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace, item, and type are required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceShared)
            const shared = repository.create({
                workspaceId: payload.workspaceId,
                sharedItemId: payload.sharedItemId,
                itemType: payload.itemType,
                createdByUserId: payload.createdByUserId
            })
            return repository.save(shared)
        })
    }

    async deleteWorkspaceShared(workspaceSharedId: string): Promise<void> {
        if (!workspaceSharedId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace shared id is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceShared)
            await repository.delete({ id: workspaceSharedId })
        })
    }

    async replaceSharedWorkspacesForItem(payload: {
        sharedItemId: string
        itemType: string
        workspaceIds: string[]
    }): Promise<WorkspaceShared[]> {
        const sharedItemId = payload?.sharedItemId
        const itemType = payload?.itemType
        if (!sharedItemId || !itemType) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Shared item id and type are required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(WorkspaceShared)
            await repository.delete({ sharedItemId, itemType })
            if (!payload.workspaceIds?.length) {
                return []
            }
            const created = payload.workspaceIds.map((workspaceId) =>
                repository.create({
                    workspaceId,
                    sharedItemId,
                    itemType
                })
            )
            return repository.save(created)
        })
    }
}
export default WorkspaceSharedService
