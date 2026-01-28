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

import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { LoggedInUser } from '../Interface.Iam'
import OrganizationUserService from '../services/organization-user.service'
import WorkspaceUserService from '../services/workspace-user.service'

const normalizePermissions = (permissions: string | string[]): string[] => {
    if (Array.isArray(permissions)) {
        return permissions.flatMap((entry) => entry.split(',').map((item) => item.trim())).filter(Boolean)
    }
    return permissions.split(',').map((item) => item.trim()).filter(Boolean)
}

const parseRolePermissions = (value?: string | string[]): string[] => {
    if (!value) {
        return []
    }
    if (Array.isArray(value)) {
        return value
    }
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const hasPermission = (user: LoggedInUser, permission: string): boolean => {
    if (!user) {
        return false
    }
    if (user.isSuperAdmin || user.isOrganizationAdmin) {
        return true
    }
    return (user.permissions ?? []).includes(permission)
}

const resolvePermissionsFromApiKey = (user: LoggedInUser, permissions: string[]): boolean => {
    const userPermissions = user.permissions ?? []
    return permissions.some((permission) => userPermissions.includes(permission))
}

const loadWorkspacePermissions = async (userId: string, workspaceId: string): Promise<string[]> => {
    const workspaceUserService = new WorkspaceUserService()
    const workspaceUser = await workspaceUserService.getWorkspaceRoleForUser(workspaceId, userId)
    return parseRolePermissions(workspaceUser?.role?.permissions)
}

const loadOrganizationPermissions = async (
    userId: string,
    organizationId: string
): Promise<{ permissions: string[]; isOwner: boolean }> => {
    const organizationUserService = new OrganizationUserService()
    const organizationUser = await organizationUserService.getOrganizationRoleForUser(organizationId, userId)
    if (!organizationUser) {
        return { permissions: [], isOwner: false }
    }
    return {
        permissions: parseRolePermissions(organizationUser.role?.permissions),
        isOwner: organizationUser.isOwner
    }
}

export const checkPermission =
    (permission: string) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as LoggedInUser | undefined
        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
            return
        }
        if (!hasPermission(user, permission)) {
            res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
            return
        }
        next()
    }

export const checkAnyPermission =
    (permissions: string | string[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as LoggedInUser | undefined
        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
            return
        }
        const required = normalizePermissions(permissions)
        const allowed = required.some((permission) => hasPermission(user, permission))
        if (!allowed) {
            res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
            return
        }
        next()
    }

export const checkWorkspacePermission =
    (permission: string, getWorkspaceId?: (req: Request) => string | undefined) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as LoggedInUser | undefined
            if (!user) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
                return
            }
            if (user.isSuperAdmin) {
                next()
                return
            }
            const workspaceId = getWorkspaceId ? getWorkspaceId(req) : user.activeWorkspaceId
            if (!workspaceId) {
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            if (!user.id) {
                if (resolvePermissionsFromApiKey(user, [permission])) {
                    next()
                    return
                }
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            const permissions = await loadWorkspacePermissions(user.id, workspaceId)
            if (!permissions.includes(permission)) {
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            next()
        } catch (error) {
            next(error)
        }
    }

export const checkAnyWorkspacePermission =
    (permissions: string | string[], getWorkspaceId?: (req: Request) => string | undefined) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as LoggedInUser | undefined
            if (!user) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
                return
            }
            if (user.isSuperAdmin) {
                next()
                return
            }
            const workspaceId = getWorkspaceId ? getWorkspaceId(req) : user.activeWorkspaceId
            if (!workspaceId) {
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            const required = normalizePermissions(permissions)
            if (!user.id) {
                if (resolvePermissionsFromApiKey(user, required)) {
                    next()
                    return
                }
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            const assigned = await loadWorkspacePermissions(user.id, workspaceId)
            const allowed = required.some((permission) => assigned.includes(permission))
            if (!allowed) {
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            next()
        } catch (error) {
            next(error)
        }
    }

export const checkOrganizationPermission =
    (permission: string, getOrganizationId?: (req: Request) => string | undefined) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as LoggedInUser | undefined
            if (!user) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
                return
            }
            if (user.isSuperAdmin) {
                next()
                return
            }
            const organizationId = getOrganizationId ? getOrganizationId(req) : user.activeOrganizationId
            if (!organizationId) {
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            if (!user.id) {
                if (resolvePermissionsFromApiKey(user, [permission])) {
                    next()
                    return
                }
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            const { permissions: assigned, isOwner } = await loadOrganizationPermissions(user.id, organizationId)
            if (isOwner || assigned.includes(permission)) {
                next()
                return
            }
            res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
        } catch (error) {
            next(error)
        }
    }

export const checkAnyOrganizationPermission =
    (permissions: string | string[], getOrganizationId?: (req: Request) => string | undefined) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as LoggedInUser | undefined
            if (!user) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
                return
            }
            if (user.isSuperAdmin) {
                next()
                return
            }
            const organizationId = getOrganizationId ? getOrganizationId(req) : user.activeOrganizationId
            if (!organizationId) {
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            const required = normalizePermissions(permissions)
            if (!user.id) {
                if (resolvePermissionsFromApiKey(user, required)) {
                    next()
                    return
                }
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            const { permissions: assigned, isOwner } = await loadOrganizationPermissions(user.id, organizationId)
            const allowed = isOwner || required.some((permission) => assigned.includes(permission))
            if (!allowed) {
                res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
                return
            }
            next()
        } catch (error) {
            next(error)
        }
    }
