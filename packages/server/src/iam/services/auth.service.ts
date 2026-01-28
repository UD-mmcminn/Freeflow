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

import { randomUUID } from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { ILoginSession, LoggedInUser } from '../Interface.Iam'
import { Organization } from '../database/entities/organization.entity'
import { OrganizationUser } from '../database/entities/organization-user.entity'
import { User } from '../database/entities/user.entity'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../middleware/passport/auth.tokens'
import { ILoginSessionService, LoginSessionService } from './login-session.service'
import { ILocalAuthService, LocalAuthService } from './local-auth.service'

type AuthSessionResult = {
    session: ILoginSession
    user: LoggedInUser
    accessToken?: string
    refreshToken?: string
    workspaceUsers: WorkspaceUser[]
}

export interface IAuthService {
    login(payload: { userId?: string; email?: string; password?: string }): Promise<AuthSessionResult>
    logout(sessionToken: string): Promise<void>
    refreshToken(refreshToken: string): Promise<AuthSessionResult>
    startSsoLogin(provider: string): Promise<any>
    handleSsoCallback(provider: string, payload: any): Promise<any>
    logoutSso(sessionToken: string): Promise<void>
}

export class AuthService implements IAuthService {
    private localAuthService: ILocalAuthService
    private loginSessionService: ILoginSessionService

    constructor(
        localAuthService: ILocalAuthService = new LocalAuthService(),
        loginSessionService: ILoginSessionService = new LoginSessionService()
    ) {
        this.localAuthService = localAuthService
        this.loginSessionService = loginSessionService
    }

    async login(payload: {
        userId?: string
        email?: string
        password?: string
    }): Promise<AuthSessionResult> {
        if (!payload.userId && !payload.email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required')
        }
        if (payload.email && !payload.password) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Password is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const userRepository = manager.getRepository(User)

            const user = await userRepository.findOne({
                where: payload.userId ? { id: payload.userId } : { email: payload.email }
            })
            if (!user) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not found')
            }
            if (user.status !== 'ACTIVE') {
                throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'User is not active')
            }
            if (payload.password) {
                const isValid = await this.localAuthService.verifyPassword(user.id, payload.password)
                if (!isValid) {
                    throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Invalid credentials')
                }
            }

            const { loggedInUser, workspaceUsers } = await this.buildLoggedInUser(manager, user)
            const tokenPayload = {
                userId: user.id,
                orgId: loggedInUser.activeOrganizationId,
                workspaceId: loggedInUser.activeWorkspaceId
            }
            const accessToken = signAccessToken(tokenPayload)
            const refreshToken = signRefreshToken(tokenPayload)
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            const session = await this.loginSessionService.createSession(
                {
                    userId: user.id,
                    sessionToken: randomUUID(),
                    refreshToken: refreshToken,
                    expiresAt
                },
                manager
            )
            return {
                session,
                user: loggedInUser,
                accessToken,
                refreshToken,
                workspaceUsers
            }
        })
    }

    async logout(sessionToken: string): Promise<void> {
        if (!sessionToken) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session token is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            await this.loginSessionService.revokeSessionByToken(sessionToken, manager)
        })
    }

    async refreshToken(refreshToken: string): Promise<AuthSessionResult> {
        if (!refreshToken) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Refresh token is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            verifyRefreshToken(refreshToken)
            const session = await this.loginSessionService.getSessionByRefreshToken(refreshToken, manager)
            if (!session) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Session not found')
            }
            if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
                await this.loginSessionService.revokeSession(session.id, manager)
                throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Session expired')
            }

            const userRepository = manager.getRepository(User)
            const user = await userRepository.findOneBy({ id: session.userId })
            if (!user) {
                await this.loginSessionService.revokeSession(session.id, manager)
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not found')
            }
            if (user.status !== 'ACTIVE') {
                await this.loginSessionService.revokeSession(session.id, manager)
                throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'User is not active')
            }

            const { loggedInUser, workspaceUsers } = await this.buildLoggedInUser(manager, user)
            const tokenPayload = {
                userId: user.id,
                orgId: loggedInUser.activeOrganizationId,
                workspaceId: loggedInUser.activeWorkspaceId
            }
            const accessToken = signAccessToken(tokenPayload)
            const nextRefreshToken = signRefreshToken(tokenPayload)
            const updated = await this.loginSessionService.rotateSessionTokens(
                session,
                {
                    sessionToken: session.sessionToken,
                    refreshToken: nextRefreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                },
                manager
            )
            return {
                session: updated,
                user: loggedInUser,
                accessToken,
                refreshToken: nextRefreshToken,
                workspaceUsers
            }
        })
    }

    async startSsoLogin(_provider: string): Promise<any> {
        return null
    }

    async handleSsoCallback(_provider: string, _payload: any): Promise<any> {
        return null
    }

    async logoutSso(_sessionToken: string): Promise<void> {
        return
    }

    private async buildLoggedInUser(
        manager: any,
        user: User
    ): Promise<{ loggedInUser: LoggedInUser; workspaceUsers: WorkspaceUser[] }> {
        const organizationUserRepository = manager.getRepository(OrganizationUser)
        const organizationRepository = manager.getRepository(Organization)
        const workspaceUserRepository = manager.getRepository(WorkspaceUser)

        const organizationUsers = await organizationUserRepository.find({
            where: { userId: user.id },
            relations: ['organization']
        })
        const activeOrganizationUser =
            organizationUsers.find((entry: OrganizationUser) => entry.status === 'ACTIVE') ?? organizationUsers[0]
        const activeOrganizationId = activeOrganizationUser?.organizationId ?? process.env.DEFAULT_ORG_ID ?? ''
        const organization = activeOrganizationId
            ? await organizationRepository.findOneBy({ id: activeOrganizationId })
            : null

        const workspaceUsers = await workspaceUserRepository.find({
            where: { userId: user.id },
            relations: ['workspace', 'role']
        })
        const preferredWorkspace =
            workspaceUsers.find(
                (entry: WorkspaceUser) =>
                    entry.status === 'ACTIVE' && entry.workspace?.organizationId === activeOrganizationId
            ) ??
            workspaceUsers.find((entry: WorkspaceUser) => entry.workspace?.organizationId === activeOrganizationId) ??
            workspaceUsers[0]

        const identityManager = getRunningExpressApp().identityManager
        const subscriptionId = organization?.subscriptionId ?? ''
        const features = identityManager ? await identityManager.getFeaturesByPlan(subscriptionId) : {}

        const permissions = this.parsePermissions(preferredWorkspace?.role?.permissions)
        const roles = preferredWorkspace?.role?.name ? [preferredWorkspace.role.name] : []

        const loggedInUser: LoggedInUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            permissions,
            roles,
            isOrganizationAdmin: activeOrganizationUser?.isOwner ?? false,
            activeOrganizationId: activeOrganizationId,
            activeOrganizationSubscriptionId: organization?.subscriptionId,
            activeOrganizationCustomerId: organization?.customerId,
            activeOrganizationProductId: organization?.productId,
            activeWorkspaceId: preferredWorkspace?.workspaceId ?? process.env.DEFAULT_WORKSPACE_ID ?? '',
            activeWorkspace: preferredWorkspace?.workspace?.name,
            activeWorkspaceRole: preferredWorkspace?.role?.name,
            features,
            authStrategy: 'local'
        }

        return { loggedInUser, workspaceUsers }
    }

    private parsePermissions(raw: string | undefined): string[] {
        if (!raw) {
            return []
        }
        try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }
}

export default AuthService
