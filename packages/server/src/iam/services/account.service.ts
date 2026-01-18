import { randomUUID } from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { AccountDescriptorInput, IAccountDescriptor, IInvite } from '../Interface.Iam'
import { Invite } from '../database/entities/invite.entity'
import { OrganizationUser } from '../database/entities/organization-user.entity'
import { Organization } from '../database/entities/organization.entity'
import { User } from '../database/entities/user.entity'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'
import { Workspace } from '../database/entities/workspace.entity'

export interface IAccountService {
    createUser(payload: AccountDescriptorInput): Promise<IAccountDescriptor>
    registerUser(payload: AccountDescriptorInput): Promise<IAccountDescriptor>
    createInvite(payload: AccountDescriptorInput): Promise<IAccountDescriptor>
    revokeInvite(inviteId: string): Promise<void>
    acceptInvite(token: string, payload: AccountDescriptorInput): Promise<IAccountDescriptor>
    resendInvite(email: string): Promise<void>
    sendVerificationEmail(email: string): Promise<void>
    verifyEmail(token: string): Promise<void>
    resendVerificationEmail(email: string): Promise<void>
    getProfile(userId: string): Promise<IAccountDescriptor | null>
    updateProfile(userId: string, payload: AccountDescriptorInput): Promise<IAccountDescriptor | null>
    deactivateAccount(userId: string): Promise<void>
    deleteAccount(userId: string): Promise<void>
}

export class AccountService implements IAccountService {
    async createUser(payload: AccountDescriptorInput): Promise<IAccountDescriptor> {
        const appServer = getRunningExpressApp()

        return appServer.AppDataSource.transaction(async (manager) => {
            return this.createUserWithManager(manager, payload)
        })
    }

    async registerUser(payload: AccountDescriptorInput): Promise<IAccountDescriptor> {
        const email = payload.user?.email
        if (!email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required to register')
        }

        const appServer = getRunningExpressApp()
        const organizationName = payload.organization?.name ?? email
        const workspaceName = payload.workspaces?.[0]?.name ?? 'Default Workspace'

        return appServer.AppDataSource.transaction(async (manager) => {
            const organizationRepository = manager.getRepository(Organization)
            const workspaceRepository = manager.getRepository(Workspace)
            const inviteRepository = manager.getRepository(Invite)

            const organization = await organizationRepository.save(
                organizationRepository.create({
                    name: organizationName,
                    subscriptionId: payload.organization?.subscriptionId,
                    customerId: payload.organization?.customerId,
                    productId: payload.organization?.productId
                })
            )

            const workspace = await workspaceRepository.save(
                workspaceRepository.create({
                    name: workspaceName,
                    organizationId: organization.id,
                    isPersonal: payload.workspaces?.[0]?.isPersonal ?? false
                })
            )

            const invite = await inviteRepository.save(
                inviteRepository.create(
                    this.buildInvite({
                        email,
                        organizationId: organization.id,
                        workspaceId: workspace.id,
                        roleId: payload.organizationUsers?.[0]?.roleId ?? payload.workspaceUsers?.[0]?.roleId
                    })
                )
            )

            return {
                organization,
                workspaces: [workspace],
                invites: [invite]
            }
        })
    }

    async createInvite(payload: AccountDescriptorInput): Promise<IAccountDescriptor> {
        const email = payload.user?.email ?? payload.invites?.[0]?.email
        if (!email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required to invite')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const inviteRepository = manager.getRepository(Invite)
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

    async acceptInvite(token: string, payload: AccountDescriptorInput): Promise<IAccountDescriptor> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const inviteRepository = manager.getRepository(Invite)
            const invite = await inviteRepository.findOneBy({ token })
            if (!invite) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Invite not found')
            }
            if (invite.acceptedAt) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invite already accepted')
            }
            if (invite.expiresAt && invite.expiresAt < new Date()) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invite expired')
            }

            invite.acceptedAt = new Date()
            await inviteRepository.save(invite)

            if (!payload.organizationUsers?.length && invite.organizationId) {
                payload.organizationUsers = [
                    {
                        organizationId: invite.organizationId,
                        roleId: invite.roleId,
                        userId: ''
                    }
                ]
            }
            if (!payload.workspaceUsers?.length && invite.workspaceId) {
                payload.workspaceUsers = [
                    {
                        workspaceId: invite.workspaceId,
                        roleId: invite.roleId,
                        userId: ''
                    }
                ]
            }

            return this.createUserWithManager(manager, payload)
        })
    }

    async resendInvite(_email: string): Promise<void> {
        return
    }

    async sendVerificationEmail(_email: string): Promise<void> {
        return
    }

    async verifyEmail(_token: string): Promise<void> {
        return
    }

    async resendVerificationEmail(_email: string): Promise<void> {
        return
    }

    async getProfile(_userId: string): Promise<IAccountDescriptor | null> {
        return null
    }

    async updateProfile(_userId: string, _payload: AccountDescriptorInput): Promise<IAccountDescriptor | null> {
        return null
    }

    async deactivateAccount(_userId: string): Promise<void> {
        return
    }

    async deleteAccount(_userId: string): Promise<void> {
        return
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
            isActive: userInput.isActive ?? true,
            emailVerified: userInput.emailVerified ?? false
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
                    isOwner: orgUser.isOwner ?? false
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
                    roleId: workspaceUser.roleId
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
}
export default AccountService
