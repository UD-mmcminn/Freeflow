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
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { clearAuthCookies, setAuthCookies } from '../middleware/passport/auth.cookies'
import { LoggedInUser } from '../Interface.Iam'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'
import getAuthConfig from '../middleware/passport/auth.config'
import Permissions from '../rbac/Permissions'
import AuthService from '../services/auth.service'
import OrganizationService from '../services/organization.service'
import { LoginRequestBody, LogoutRequestBody, RefreshTokenRequestBody } from '../types/auth.requests'
import { AuthAssignedWorkspace, AuthPayload, LogoutResponse } from '../types/auth.responses'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

export interface IAuthController {
    resolveLogin(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    login(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    logout(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    getPermissions(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class AuthController implements IAuthController {
    private authService: AuthService
    private organizationService: OrganizationService

    constructor(authService: AuthService = new AuthService(), organizationService: OrganizationService = new OrganizationService()) {
        this.authService = authService
        this.organizationService = organizationService
    }

    async resolveLogin(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const identityManager = getRunningExpressApp()?.identityManager
            if (!identityManager?.isIam?.()) {
                return res.status(StatusCodes.OK).json({ redirectUrl: '/signin' })
            }
            const hasOrganizations = await this.organizationService.hasOrganizations()
            const redirectUrl = hasOrganizations ? '/signin' : '/organization-setup'
            return res.status(StatusCodes.OK).json({ redirectUrl })
        } catch (error) {
            next(error)
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<Response<AuthPayload> | void> {
        try {
            const body = (req.body ?? {}) as LoginRequestBody
            const result = await this.authService.login(body)
            if (req.session?.regenerate) {
                await new Promise<void>((resolve, reject) => {
                    req.session.regenerate((err) => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
            }
            if (req.login && result.user) {
                await new Promise<void>((resolve, reject) => {
                    req.login(result.user, (err) => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
            }
            if (req.session?.save) {
                await new Promise<void>((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
            }
            if (result.accessToken && result.refreshToken) {
                setAuthCookies(res, result.accessToken, result.refreshToken)
            }
            if (!result.user) {
                throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Login user is missing')
            }
            const assignedWorkspaces = this.buildAssignedWorkspaces(result.workspaceUsers ?? [])
            const payload = this.buildAuthPayload(result.user, result.session.sessionToken, assignedWorkspaces)
            return res.status(StatusCodes.OK).json(payload)
        } catch (error) {
            next(error)
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<Response<LogoutResponse> | void> {
        try {
            const body = req.body as LogoutRequestBody
            const sessionToken = body?.sessionToken
            if (!sessionToken) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session token is required')
            }
            await this.authService.logout(sessionToken)
            clearAuthCookies(res)
            if (req.logout) {
                req.logout(() => undefined)
            }
            if (req.session) {
                req.session.destroy(() => undefined)
            }
            return res.status(StatusCodes.OK).json({ message: 'logged_out', redirectTo: '/login' })
        } catch (error) {
            next(error)
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response<AuthPayload> | void> {
        try {
            const body = req.body as RefreshTokenRequestBody
            const refreshToken = body?.refreshToken ?? req.cookies?.[getAuthConfig().cookies.refreshTokenName]
            if (!refreshToken) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Refresh token is required')
            }
            const result = await this.authService.refreshToken(refreshToken)
            if (result.accessToken && result.refreshToken) {
                setAuthCookies(res, result.accessToken, result.refreshToken)
            }
            if (!result.user) {
                throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Refresh user is missing')
            }
            const assignedWorkspaces = this.buildAssignedWorkspaces(result.workspaceUsers ?? [])
            const payload = this.buildAuthPayload(result.user, result.session.sessionToken, assignedWorkspaces)
            return res.status(StatusCodes.OK).json(payload)
        } catch (error) {
            next(error)
        }
    }

    async getPermissions(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const identityManager = getRunningExpressApp()?.identityManager
            const permissionsProvider = identityManager?.getPermissions
                ? identityManager.getPermissions()
                : new Permissions()
            const permissions = permissionsProvider.getAllPermissions()
            return res.status(StatusCodes.OK).json(permissions)
        } catch (error) {
            next(error)
        }
    }

    private buildAssignedWorkspaces(workspaceUsers: WorkspaceUser[]): AuthAssignedWorkspace[] {
        return workspaceUsers
            .filter((entry) => entry.status !== 'DISABLED')
            .map((entry) => ({
                id: entry.workspaceId,
                name: entry.workspace?.name ?? '',
                role: entry.role?.name,
                organizationId: entry.workspace?.organizationId
            }))
    }

    private buildAuthPayload(
        user: LoggedInUser,
        sessionToken: string,
        assignedWorkspaces: AuthAssignedWorkspace[]
    ): AuthPayload {
        const email = user.email ?? ''
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
        return {
            id: user.id,
            email,
            name: fullName || email,
            status: 'ACTIVE',
            role: user.activeWorkspaceRole ?? null,
            isSSO: user.authStrategy ? user.authStrategy !== 'local' : false,
            activeOrganizationId: user.activeOrganizationId ?? '',
            activeOrganizationSubscriptionId: user.activeOrganizationSubscriptionId,
            activeOrganizationCustomerId: user.activeOrganizationCustomerId,
            activeOrganizationProductId: user.activeOrganizationProductId,
            activeWorkspaceId: user.activeWorkspaceId ?? '',
            activeWorkspace: user.activeWorkspace,
            lastLogin: null,
            isOrganizationAdmin: user.isOrganizationAdmin ?? false,
            assignedWorkspaces,
            permissions: user.permissions ?? [],
            features: user.features ?? {},
            token: sessionToken
        }
    }
}

export default AuthController
