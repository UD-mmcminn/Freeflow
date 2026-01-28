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
import { AccountDescriptorInput, IAccountDescriptor, IInvite } from '../Interface.Iam'
import { Invite } from '../database/entities/invite.entity'
import { OrganizationUser } from '../database/entities/organization-user.entity'
import { Organization } from '../database/entities/organization.entity'
import { Role } from '../database/entities/role.entity'
import { User } from '../database/entities/user.entity'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'
import { Workspace } from '../database/entities/workspace.entity'
import { LoginMethod, LoginMethodStatus } from '../database/entities/login-method.entity'
import { ILoginSessionService, LoginSessionService } from './login-session.service'
import { INotificationService, NotificationService } from './notification.service'
import { ILocalAuthService, LocalAuthService } from './local-auth.service'
import { In, IsNull } from 'typeorm'

export type InviteNextStep = {
    type: 'local-auth'
    token: string
    expiresAt: number
}

export interface IAccountService {
    createUser(payload: AccountDescriptorInput): Promise<IAccountDescriptor>
    createInvite(payload: AccountDescriptorInput): Promise<IAccountDescriptor>
    revokeInvite(inviteId: string): Promise<void>
    acceptInvite(token: string, payload: AccountDescriptorInput): Promise<IAccountDescriptor>
    acceptInviteWithContext(
        token: string,
        payload: AccountDescriptorInput
    ): Promise<{ account: IAccountDescriptor; invite: Invite; nextSteps: InviteNextStep[] }>
    setPasswordFromInvite(token: string, password: string): Promise<IAccountDescriptor>
    resendInvite(payload: AccountDescriptorInput): Promise<void>
    getProfile(payload: AccountDescriptorInput): Promise<IAccountDescriptor | null>
    updateProfile(payload: AccountDescriptorInput): Promise<IAccountDescriptor | null>
    deactivateAccount(userId: string): Promise<void>
    deleteAccount(userId: string): Promise<void>
}

export class AccountService implements IAccountService {
    private notificationService: INotificationService
    private localAuthService: ILocalAuthService
    private loginSessionService: ILoginSessionService

    constructor(
        notificationService: INotificationService = new NotificationService(),
        localAuthService: ILocalAuthService = new LocalAuthService(),
        loginSessionService: ILoginSessionService = new LoginSessionService()
    ) {
        this.notificationService = notificationService
        this.localAuthService = localAuthService
        this.loginSessionService = loginSessionService
    }

    private async buildInviteNextSteps(manager: any, userId: string, organizationId?: string): Promise<InviteNextStep[]> {
        const loginMethodRepository = manager.getRepository(LoginMethod)
        const methods = await loginMethodRepository.find({
            where: organizationId ? { organizationId } : { organizationId: null }
        })
        const ssoEnabled = methods.some((method: LoginMethod) => method.status === LoginMethodStatus.ENABLE)
        if (ssoEnabled) {
            return []
        }
        const resetToken = await this.localAuthService.createResetTokenWithManager(manager, userId)
        return [
            {
                type: 'local-auth',
                token: resetToken.token,
                expiresAt: resetToken.expiresAt
            }
        ]
    }

    async createUser(payload: AccountDescriptorInput): Promise<IAccountDescriptor> {
        const appServer = getRunningExpressApp()

        return appServer.AppDataSource.transaction(async (manager) => {
            return this.createUserWithManager(manager, payload)
        })
    }

    async createInvite(payload: AccountDescriptorInput): Promise<IAccountDescriptor> {
        const email = payload.user?.email ?? payload.invites?.[0]?.email
        if (!email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required to invite')
        }
        const appServer = getRunningExpressApp()
        const result = await appServer.AppDataSource.transaction(async (manager) => {
            const inviteRepository = manager.getRepository(Invite)
            const userRepository = manager.getRepository(User)

            const existingUser = await userRepository.findOneBy({ email })
            if (!existingUser) {
                await userRepository.save(
                    userRepository.create({
                        email,
                        firstName: payload.user?.firstName,
                        lastName: payload.user?.lastName,
                        status: 'PENDING'
                    })
                )
            }

            const invite = await inviteRepository.save(
                inviteRepository.create(
                    this.buildInvite({
                        email,
                        organizationId: payload.organization?.id ?? payload.organizationUsers?.[0]?.organizationId,
                        workspaceId: payload.workspaces?.[0]?.id ?? payload.workspaceUsers?.[0]?.workspaceId,
                        roleId: payload.organizationUsers?.[0]?.roleId ?? payload.workspaceUsers?.[0]?.roleId,
                        expiresAt: payload.invites?.[0]?.expiresAt
                    })
                )
            )

            return {
                invites: [invite]
            }
        })

        if (result.invites?.[0]) {
            await this.notificationService.sendInvite(result.invites[0])
        }

        return result
    }

    async revokeInvite(inviteId: string): Promise<void> {
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const inviteRepository = manager.getRepository(Invite)
            const invite = await inviteRepository.findOneBy({ id: inviteId })
            if (!invite) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Invite not found')
            }
            invite.acceptedAt = new Date()
            await inviteRepository.save(invite)
        })
    }

    async acceptInvite(token: string, _payload: AccountDescriptorInput): Promise<IAccountDescriptor> {
        const result = await this.acceptInviteWithContext(token, _payload)
        return result.account
    }

    async acceptInviteWithContext(
        token: string,
        _payload: AccountDescriptorInput
    ): Promise<{ account: IAccountDescriptor; invite: Invite; nextSteps: InviteNextStep[] }> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const inviteRepository = manager.getRepository(Invite)
            const invite = await inviteRepository.findOneBy({ token, acceptedAt: IsNull() })
            if (!invite) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Invite not found')
            }
            if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
                throw new InternalFlowiseError(StatusCodes.GONE, 'Invite expired')
            }

            const userRepository = manager.getRepository(User)
            const organizationUserRepository = manager.getRepository(OrganizationUser)
            const workspaceUserRepository = manager.getRepository(WorkspaceUser)

            let user = await userRepository.findOneBy({ email: invite.email })
            if (!user) {
                user = await userRepository.save(
                    userRepository.create({
                        email: invite.email,
                        status: 'PENDING'
                    })
                )
            }

            let hasActiveOrgUser = false
            if (invite.organizationId) {
                const existingOrgUser = await organizationUserRepository.findOneBy({
                    organizationId: invite.organizationId,
                    userId: user.id
                })
                if (!existingOrgUser) {
                    await organizationUserRepository.save(
                        organizationUserRepository.create({
                            organizationId: invite.organizationId,
                            userId: user.id,
                            roleId: invite.roleId,
                            status: 'ACTIVE'
                        })
                    )
                    hasActiveOrgUser = true
                } else if (existingOrgUser.status === 'ACTIVE') {
                    hasActiveOrgUser = true
                } else {
                    existingOrgUser.status = 'ACTIVE'
                    if (!existingOrgUser.roleId && invite.roleId) {
                        existingOrgUser.roleId = invite.roleId
                    }
                    await organizationUserRepository.save(existingOrgUser)
                    hasActiveOrgUser = true
                }
            }

            if (invite.workspaceId) {
                const existingWorkspaceUser = await workspaceUserRepository.findOneBy({
                    workspaceId: invite.workspaceId,
                    userId: user.id
                })
                if (!existingWorkspaceUser) {
                    await workspaceUserRepository.save(
                        workspaceUserRepository.create({
                            workspaceId: invite.workspaceId,
                            userId: user.id,
                            roleId: invite.roleId,
                            status: 'ACTIVE'
                        })
                    )
                } else if (existingWorkspaceUser.status !== 'ACTIVE') {
                    existingWorkspaceUser.status = 'ACTIVE'
                    if (!existingWorkspaceUser.roleId && invite.roleId) {
                        existingWorkspaceUser.roleId = invite.roleId
                    }
                    await workspaceUserRepository.save(existingWorkspaceUser)
                }
            }

            if (user.status !== 'DISABLED' && hasActiveOrgUser) {
                user.status = 'ACTIVE'
                user = await userRepository.save(user)
            }

            invite.acceptedAt = new Date()
            await inviteRepository.save(invite)

            const account = await this.buildProfileWithManager(manager, user)
            const nextSteps = await this.buildInviteNextSteps(manager, user.id, invite.organizationId)
            return { account, invite, nextSteps }
        })
    }

    async setPasswordFromInvite(token: string, password: string): Promise<IAccountDescriptor> {
        if (!token) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invite token is required')
        }
        if (!password) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Password is required')
        }
        let account: IAccountDescriptor = {}
        try {
            account = await this.acceptInvite(token, {})
        } catch (error) {
            if (
                !(error instanceof InternalFlowiseError) ||
                ![StatusCodes.NOT_FOUND, StatusCodes.GONE].includes(error.statusCode)
            ) {
                throw error
            }
        }
        await this.localAuthService.resetPassword(token, password)
        return account
    }

    async resendInvite(payload: AccountDescriptorInput): Promise<void> {
        const email = payload.user?.email ?? payload.invites?.[0]?.email
        const organizationId =
            payload.organization?.id ?? payload.organizationUsers?.[0]?.organizationId ?? payload.invites?.[0]?.organizationId

        if (!email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required to resend invite')
        }

        const appServer = getRunningExpressApp()
        const invite = await appServer.AppDataSource.transaction(async (manager) => {
            const inviteRepository = manager.getRepository(Invite)
            const latestInvite = await inviteRepository.findOne({
                where: organizationId ? { email, organizationId, acceptedAt: IsNull() } : { email, acceptedAt: IsNull() },
                order: { createdDate: 'DESC' }
            })

            if (!latestInvite) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'No pending invite found')
            }

            return inviteRepository.save(
                inviteRepository.create(
                    this.buildInvite({
                        email,
                        organizationId: latestInvite.organizationId,
                        workspaceId: latestInvite.workspaceId,
                        roleId: latestInvite.roleId
                    })
                )
            )
        })

        await this.notificationService.sendInvite(invite)
    }

    async getProfile(payload: AccountDescriptorInput): Promise<IAccountDescriptor | null> {
        const userId = payload.user?.id
        const email = payload.user?.email
        if (!userId && !email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id or email is required')
        }

        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const userRepository = manager.getRepository(User)
            const user = await userRepository.findOne({
                where: userId ? { id: userId } : { email }
            })
            if (!user) return null

            return this.buildProfileWithManager(manager, user)
        })
    }

    async updateProfile(payload: AccountDescriptorInput): Promise<IAccountDescriptor | null> {
        const userId = payload.user?.id
        const email = payload.user?.email
        if (!userId && !email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id or email is required')
        }

        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const userRepository = manager.getRepository(User)
            const user = await userRepository.findOne({
                where: userId ? { id: userId } : { email }
            })
            if (!user) return null

            const updates = payload.user ?? {}
            const updatedUser = userRepository.merge(user, {
                firstName: updates.firstName ?? user.firstName,
                lastName: updates.lastName ?? user.lastName,
                status: updates.status ?? user.status
            })
            await userRepository.save(updatedUser)
            if (updates.status && updates.status !== user.status && updates.status !== 'ACTIVE') {
                await this.loginSessionService.revokeSessionsByUserId(updatedUser.id, manager)
            }

            return this.buildProfileWithManager(manager, updatedUser)
        })
    }

    async deactivateAccount(_userId: string): Promise<void> {
        const userId = _userId
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id is required')
        }

        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const userRepository = manager.getRepository(User)
            const user = await userRepository.findOneBy({ id: userId })
            if (!user) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not found')
            }

            user.status = 'DISABLED'
            await userRepository.save(user)
            await this.loginSessionService.revokeSessionsByUserId(user.id, manager)
        })
    }

    async deleteAccount(_userId: string): Promise<void> {
        throw new InternalFlowiseError(StatusCodes.NOT_IMPLEMENTED, 'Account deletion is not supported')
    }

    private async createUserWithManager(manager: any, payload: AccountDescriptorInput): Promise<IAccountDescriptor> {
        const userInput = payload.user
        if (!userInput?.email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required to create a user')
        }

        const userRepository = manager.getRepository(User)
        const newUser = userRepository.create({
            email: userInput.email,
            firstName: userInput.firstName,
            lastName: userInput.lastName,
            status: userInput.status ?? 'ACTIVE'
        })
        const savedUser = await userRepository.save(newUser)

        const orgUsersInput = payload.organizationUsers ?? []
        const createdOrganizationUsers: OrganizationUser[] = []
        if (orgUsersInput.length > 0) {
            const orgUserRepository = manager.getRepository(OrganizationUser)
            for (const orgUser of orgUsersInput) {
                if (!orgUser.organizationId) continue
                const created = orgUserRepository.create({
                    organizationId: orgUser.organizationId,
                    userId: savedUser.id,
                    roleId: orgUser.roleId,
                    isOwner: orgUser.isOwner ?? false,
                    status: orgUser.status ?? 'ACTIVE'
                })
                createdOrganizationUsers.push(await orgUserRepository.save(created))
            }
        }

        const workspaceUsersInput = payload.workspaceUsers ?? []
        const createdWorkspaceUsers: WorkspaceUser[] = []
        if (workspaceUsersInput.length > 0) {
            const workspaceUserRepository = manager.getRepository(WorkspaceUser)
            for (const workspaceUser of workspaceUsersInput) {
                if (!workspaceUser.workspaceId) continue
                const created = workspaceUserRepository.create({
                    workspaceId: workspaceUser.workspaceId,
                    userId: savedUser.id,
                    roleId: workspaceUser.roleId,
                    status: workspaceUser.status ?? 'ACTIVE'
                })
                createdWorkspaceUsers.push(await workspaceUserRepository.save(created))
            }
        }

        return {
            user: savedUser,
            organizationUsers: createdOrganizationUsers,
            workspaceUsers: createdWorkspaceUsers
        }
    }

    private buildInvite(input: Partial<IInvite>): IInvite {
        const expiresAt = input.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        return {
            id: randomUUID(),
            email: input.email ?? '',
            organizationId: input.organizationId,
            workspaceId: input.workspaceId,
            roleId: input.roleId,
            token: input.token ?? randomUUID(),
            expiresAt,
            createdDate: new Date()
        }
    }

    private async buildProfileWithManager(manager: any, user: User): Promise<IAccountDescriptor> {
        const organizationUserRepository = manager.getRepository(OrganizationUser)
        const workspaceUserRepository = manager.getRepository(WorkspaceUser)
        const organizationRepository = manager.getRepository(Organization)
        const workspaceRepository = manager.getRepository(Workspace)
        const roleRepository = manager.getRepository(Role)

        const organizationUsers = await organizationUserRepository.findBy({ userId: user.id })
        const workspaceUsers = await workspaceUserRepository.findBy({ userId: user.id })

        const organizationIds = organizationUsers.map((entry: OrganizationUser) => entry.organizationId).filter(Boolean) as string[]
        const workspaceIds = workspaceUsers.map((entry: WorkspaceUser) => entry.workspaceId).filter(Boolean) as string[]
        const roleIds = [...organizationUsers, ...workspaceUsers]
            .map((entry: OrganizationUser | WorkspaceUser) => entry.roleId)
            .filter(Boolean) as string[]

        const organizations = organizationIds.length ? await organizationRepository.findBy({ id: In(organizationIds) }) : []
        const workspaces = workspaceIds.length ? await workspaceRepository.findBy({ id: In(workspaceIds) }) : []
        const roles = roleIds.length ? await roleRepository.findBy({ id: In(roleIds) }) : []

        return {
            user,
            organizationUsers,
            workspaceUsers,
            organization: organizations[0],
            workspaces,
            roles
        }
    }
}
export default AccountService
