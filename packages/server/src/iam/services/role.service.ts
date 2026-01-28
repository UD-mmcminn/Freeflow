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
import { IsNull } from 'typeorm'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { LoggedInUser, RoleScope } from '../Interface.Iam'
import { OrganizationUser } from '../database/entities/organization-user.entity'
import { Role } from '../database/entities/role.entity'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'

export interface IRoleService {
    listRoles(organizationId: string | undefined, scope: RoleScope | undefined, actor: LoggedInUser): Promise<Role[]>
    getRoleById(roleId: string, actor: LoggedInUser): Promise<Role | null>
    getRoleByName(name: string, organizationId: string | undefined, actor: LoggedInUser): Promise<Role | null>
    createRole(payload: any, actor: LoggedInUser): Promise<Role>
    updateRole(roleId: string, payload: any, actor: LoggedInUser): Promise<Role>
    deleteRole(roleId: string, actor: LoggedInUser): Promise<void>
}

export class RoleService implements IRoleService {
    async listRoles(organizationId: string | undefined, scope: RoleScope | undefined, actor: LoggedInUser): Promise<Role[]> {
        const scopedOrganizationId = this.resolveOrganizationId(actor, organizationId)
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Role)
            const baseWhere = scopedOrganizationId
                ? [{ organizationId: scopedOrganizationId }, { organizationId: IsNull() }]
                : [{ organizationId: IsNull() }]
            const where = scope ? baseWhere.map((entry) => ({ ...entry, scope })) : baseWhere
            return repository.find({ where, order: { name: 'ASC' } })
        })
    }

    async getRoleById(roleId: string, actor: LoggedInUser): Promise<Role | null> {
        if (!roleId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Role id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Role)
            const role = await repository.findOneBy({ id: roleId })
            if (role) {
                this.assertReadRoleAccess(role, actor)
            }
            return role
        })
    }

    async getRoleByName(name: string, organizationId: string | undefined, actor: LoggedInUser): Promise<Role | null> {
        if (!name) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Role name is required')
        }
        const scopedOrganizationId = this.resolveOrganizationId(actor, organizationId)
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Role)
            const where = scopedOrganizationId
                ? [{ name, organizationId: scopedOrganizationId }, { name, organizationId: IsNull() }]
                : [{ name, organizationId: IsNull() }]
            const roles = await repository.find({ where })
            const role = roles[0] ?? null
            if (role) {
                this.assertReadRoleAccess(role, actor)
            }
            return role
        })
    }

    async createRole(payload: any, actor: LoggedInUser): Promise<Role> {
        if (!payload?.name) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Role name is required')
        }
        const scope: RoleScope = payload.scope ?? 'organization'
        if (scope === 'system' && !actor.isSuperAdmin) {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Role access denied')
        }
        const organizationId = scope === 'system' ? undefined : this.resolveOrganizationId(actor, payload.organizationId)
        if (scope !== 'system' && !organizationId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Role)
            const permissions = this.normalizePermissions(payload.permissions)
            const role = repository.create({
                name: payload.name,
                description: payload.description,
                permissions,
                scope,
                ...(organizationId ? { organizationId } : {})
            } as Partial<Role>)
            return repository.save(role)
        })
    }

    async updateRole(roleId: string, payload: any, actor: LoggedInUser): Promise<Role> {
        const id = roleId || payload?.id
        if (!id) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Role id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(Role)
            const role = await repository.findOneBy({ id })
            if (!role) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Role not found')
            }
            if (payload?.organizationId && !actor.isSuperAdmin && payload.organizationId !== role.organizationId) {
                throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Role access denied')
            }
            if (!actor.isSuperAdmin) {
                this.assertManageRoleAccess(role, actor)
            }
            const nextScope = (payload?.scope ?? role.scope) as RoleScope
            if (nextScope === 'system' && !actor.isSuperAdmin) {
                throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Role access denied')
            }
            const permissions =
                payload?.permissions !== undefined ? this.normalizePermissions(payload.permissions) : role.permissions
            const updated = repository.merge(role, {
                name: payload?.name ?? role.name,
                description: payload?.description ?? role.description,
                permissions,
                scope: nextScope
            })
            return repository.save(updated)
        })
    }

    async deleteRole(roleId: string, actor: LoggedInUser): Promise<void> {
        if (!roleId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Role id is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const roleRepository = manager.getRepository(Role)
            const role = await roleRepository.findOneBy({ id: roleId })
            if (!role) {
                return
            }
            if (!actor.isSuperAdmin) {
                this.assertManageRoleAccess(role, actor)
            }
            await manager.getRepository(OrganizationUser).update({ roleId }, { roleId: null } as any)
            await manager.getRepository(WorkspaceUser).update({ roleId }, { roleId: null } as any)
            await roleRepository.delete({ id: roleId })
        })
    }

    private normalizePermissions(value: unknown): string {
        if (!value) {
            return '[]'
        }
        if (Array.isArray(value)) {
            return JSON.stringify(value)
        }
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value)
                return JSON.stringify(parsed)
            } catch {
                return '[]'
            }
        }
        return '[]'
    }

    private resolveOrganizationId(actor: LoggedInUser, organizationId?: string): string | undefined {
        if (actor.isSuperAdmin) {
            return organizationId
        }
        const activeOrganizationId = actor.activeOrganizationId
        if (!activeOrganizationId) {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Organization access denied')
        }
        if (organizationId && organizationId !== activeOrganizationId) {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Organization access denied')
        }
        return activeOrganizationId
    }

    private assertReadRoleAccess(role: Role, actor: LoggedInUser): void {
        if (actor.isSuperAdmin) {
            return
        }
        if (role.organizationId && role.organizationId !== actor.activeOrganizationId) {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Role access denied')
        }
    }

    private assertManageRoleAccess(role: Role, actor: LoggedInUser): void {
        if (actor.isSuperAdmin) {
            return
        }
        if (!role.organizationId || role.organizationId !== actor.activeOrganizationId) {
            throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Role access denied')
        }
    }
}
export default RoleService
