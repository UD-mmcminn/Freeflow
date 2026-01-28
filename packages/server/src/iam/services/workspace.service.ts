/*
 * Copyright (c) 2026 Union Dynamic, Inc
 *
 * This source code is licensed under the "IAM Module License" (AGPLv3 + AI Clause).
 * You may not use this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the LICENSE file in this directory for the full license text and
 * restrictions regarding Artificial Intelligence training.
 */

import { StatusCodes } from 'http-status-codes'
import { In } from 'typeorm'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Workspace } from '../database/entities/workspace.entity'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'

export interface IWorkspaceService {
    getSharedItemsForWorkspace(workspaceId: string, itemType: string): Promise<any[]>
    listWorkspaces(organizationId?: string): Promise<any[]>
    getWorkspaceById(workspaceId: string): Promise<any | null>
    createWorkspace(payload: any): Promise<any>
    updateWorkspace(workspaceId: string, payload: any): Promise<any>
    deleteWorkspace(workspaceId: string): Promise<void>
}

export class WorkspaceService implements IWorkspaceService {
    async getSharedItemsForWorkspace(_workspaceId: string, _itemType: string): Promise<any[]> {
        return []
    }

    async listWorkspaces(organizationId?: string): Promise<any[]> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const workspaceRepository = manager.getRepository(Workspace)
            const workspaceUserRepository = manager.getRepository(WorkspaceUser)
            const workspaces = await workspaceRepository.find({
                where: organizationId ? { organizationId } : undefined
            })
            if (workspaces.length === 0) {
                return []
            }
            const workspaceIds = workspaces.map((workspace) => workspace.id)
            const workspaceUsers = await workspaceUserRepository.find({
                where: workspaceIds.length ? { workspaceId: In(workspaceIds) } : undefined
            })

            const counts = workspaceUsers.reduce<Record<string, number>>((acc, entry) => {
                if (entry.status === 'DISABLED') {
                    return acc
                }
                acc[entry.workspaceId] = (acc[entry.workspaceId] ?? 0) + 1
                return acc
            }, {})

            return workspaces
                .filter((workspace) => (counts[workspace.id] ?? 0) > 0)
                .map((workspace) => ({
                    ...workspace,
                    description: (workspace as { description?: string }).description,
                    userCount: counts[workspace.id] ?? 0,
                    isOrgDefault: workspace.name === 'Default Workspace'
                }))
        })
    }

    async getWorkspaceById(workspaceId: string): Promise<any | null> {
        if (!workspaceId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Workspace)
            return repository.findOneBy({ id: workspaceId })
        })
    }

    async createWorkspace(payload: any): Promise<any> {
        const name = payload?.name?.trim()
        const organizationId = payload?.organizationId
        const createdBy = payload?.createdBy
        if (!name) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace name is required')
        }
        if (!organizationId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
        }
        if (!createdBy) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Creator id is required')
        }

        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const workspaceRepository = manager.getRepository(Workspace)
            const workspaceUserRepository = manager.getRepository(WorkspaceUser)

            const workspace = workspaceRepository.create({
                name,
                organizationId,
                isPersonal: payload?.isPersonal ?? false
            })
            const saved = await workspaceRepository.save(workspace)

            let inheritedRoleId: string | undefined
            if (payload?.existingWorkspaceId) {
                const existingWorkspaceUser = await workspaceUserRepository.findOneBy({
                    workspaceId: payload.existingWorkspaceId,
                    userId: createdBy
                })
                inheritedRoleId = existingWorkspaceUser?.roleId
            }

            const workspaceUser = workspaceUserRepository.create({
                workspaceId: saved.id,
                userId: createdBy,
                roleId: inheritedRoleId,
                status: 'ACTIVE'
            })
            await workspaceUserRepository.save(workspaceUser)

            return {
                ...saved,
                description: payload?.description,
                userCount: 1,
                isOrgDefault: saved.name === 'Default Workspace'
            }
        })
    }

    async updateWorkspace(workspaceId: string, payload: any): Promise<any> {
        if (!workspaceId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Workspace)
            const workspace = await repository.findOneBy({ id: workspaceId })
            if (!workspace) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Workspace not found')
            }
            const updated = repository.merge(workspace, {
                name: payload?.name ?? workspace.name
            })
            const saved = await repository.save(updated)
            return {
                ...saved,
                description: payload?.description
            }
        })
    }

    async deleteWorkspace(workspaceId: string): Promise<void> {
        if (!workspaceId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace id is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const workspaceRepository = manager.getRepository(Workspace)
            const workspaceUserRepository = manager.getRepository(WorkspaceUser)
            const workspace = await workspaceRepository.findOneBy({ id: workspaceId })
            if (!workspace) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Workspace not found')
            }
            if (workspace.name === 'Default Workspace' || workspace.isPersonal) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Default workspace cannot be deleted')
            }
            const workspaceUsers = await workspaceUserRepository.find({ where: { workspaceId } })
            const activeCount = workspaceUsers.filter((entry) => entry.status !== 'DISABLED').length
            if (activeCount > 1) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace has active users')
            }
            await workspaceUserRepository.update({ workspaceId }, { status: 'DISABLED' } as any)
        })
    }
}
export default WorkspaceService
