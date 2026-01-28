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
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Organization } from '../database/entities/organization.entity'
import { Role } from '../database/entities/role.entity'
import { Workspace } from '../database/entities/workspace.entity'
import { PERMISSION_KEYS } from '../rbac/Permissions'
import { Raw } from 'typeorm'
import logger, { expressRequestLogger } from '../../utils/logger'

export interface IOrganizationService {
    readOrganization(queryRunner?: any): Promise<Organization[]>
    listOrganizations(): Promise<Organization[]>
    hasOrganizations(manager?: any): Promise<boolean>
    getOrganizationById(organizationId: string): Promise<Organization | null>
    createOrganization(
        payload: any,
        manager?: any
    ): Promise<{ organization: Organization; workspace?: Workspace; role?: Role }>
    updateOrganization(organizationId: string, payload: any): Promise<Organization | null>
    deleteOrganization(organizationId: string): Promise<void>
}

export class OrganizationService implements IOrganizationService {
    async readOrganization(queryRunner?: any): Promise<Organization[]> {
        if (queryRunner) {
            return queryRunner.manager.getRepository(Organization).find()
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            return manager.getRepository(Organization).find()
        })
    }

    async listOrganizations(): Promise<Organization[]> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            return manager.getRepository(Organization).find()
        })
    }

    async hasOrganizations(manager?: any): Promise<boolean> {
        logger.info(`test`)
        const execute = async (transactionManager: any) => {
            const count = await transactionManager.getRepository(Organization).count()
            logger.info(count)
            return count > 0
        }
        if (manager) {
            return execute(manager)
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (transactionManager) => execute(transactionManager))
    }

    async getOrganizationById(organizationId: string): Promise<Organization | null> {
        if (!organizationId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            return manager.getRepository(Organization).findOneBy({ id: organizationId })
        })
    }

    async createOrganization(
        payload: any,
        manager?: any
    ): Promise<{ organization: Organization; workspace?: Workspace; role?: Role }> {
        const name = payload?.name?.trim()
        if (!name) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization name is required')
        }
        const execute = async (transactionManager: any) => {
            const repository = transactionManager.getRepository(Organization)
            const existing = await repository.findOne({
                where: { name: Raw((alias) => `LOWER(${alias}) = LOWER(:name)`, { name }) }
            })
            if (existing) {
                throw new InternalFlowiseError(StatusCodes.CONFLICT, 'Organization already exists')
            }
            const organization = repository.create({
                name,
                subscriptionId: payload?.subscriptionId,
                customerId: payload?.customerId,
                productId: payload?.productId
            })
            const savedOrganization = await repository.save(organization)
            const workspaceRepository = transactionManager.getRepository(Workspace)
            const roleRepository = transactionManager.getRepository(Role)

            let role: Role | null = null
            if (payload?.roleId === false) {
                role = null
            } else if (payload?.roleId) {
                role = await roleRepository.findOneBy({ id: payload.roleId })
                if (!role) {
                    throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Role not found')
                }
                if (role.organizationId && role.organizationId !== savedOrganization.id) {
                    throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Role does not belong to organization')
                }
            } else {
                const permissions = Array.isArray(payload?.rolePermissions) ? payload.rolePermissions : PERMISSION_KEYS
                role = await roleRepository.save(
                    roleRepository.create({
                        name: payload?.roleName ?? 'Admin',
                        description: payload?.roleDescription,
                        permissions: JSON.stringify(permissions),
                        scope: 'organization',
                        organizationId: savedOrganization.id
                    })
                )
            }

            let workspace: Workspace | null = null
            if (payload?.workspaceId === false) {
                workspace = null
            } else if (payload?.workspaceId) {
                workspace = await workspaceRepository.findOneBy({ id: payload.workspaceId })
                if (!workspace) {
                    throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Workspace not found')
                }
                if (workspace.organizationId !== savedOrganization.id) {
                    throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Workspace does not belong to organization')
                }
            } else {
                workspace = await workspaceRepository.save(
                    workspaceRepository.create({
                        name: payload?.workspaceName ?? 'Default Workspace',
                        organizationId: savedOrganization.id,
                        isPersonal: payload?.workspaceIsPersonal ?? false
                    })
                )
            }

            return { organization: savedOrganization, workspace: workspace ?? undefined, role: role ?? undefined }
        }

        if (manager) {
            return execute(manager)
        }

        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (transactionManager) => execute(transactionManager))
    }

    async updateOrganization(organizationId: string, payload: any): Promise<Organization | null> {
        if (!organizationId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Organization)
            const organization = await repository.findOneBy({ id: organizationId })
            if (!organization) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Organization not found')
            }
            const updated = repository.merge(organization, {
                name: payload?.name ?? organization.name,
                subscriptionId: payload?.subscriptionId ?? organization.subscriptionId,
                customerId: payload?.customerId ?? organization.customerId,
                productId: payload?.productId ?? organization.productId
            })
            return repository.save(updated)
        })
    }

    async deleteOrganization(organizationId: string): Promise<void> {
        if (!organizationId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Organization)
            await repository.delete({ id: organizationId })
        })
    }
}
export default OrganizationService
