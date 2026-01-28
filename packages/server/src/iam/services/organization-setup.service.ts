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
import { IAccountDescriptor } from '../Interface.Iam'
import { Invite } from '../database/entities/invite.entity'
import { OrganizationUser } from '../database/entities/organization-user.entity'
import { User } from '../database/entities/user.entity'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'
import { INotificationService, NotificationService } from './notification.service'
import OrganizationService from './organization.service'

export interface OrganizationSetupInput {
    organization: {
        name: string
        subscriptionId?: string
        customerId?: string
        productId?: string
    }
    user?: {
        id?: string
        email?: string
        firstName?: string
        lastName?: string
    }
    workspace?: {
        id?: string
        name?: string
        isPersonal?: boolean
    }
    role?: {
        id?: string
        name?: string
        permissions?: string[]
    }
}

export interface IOrganizationSetupService {
    setupOrganization(payload: OrganizationSetupInput): Promise<IAccountDescriptor>
}

export class OrganizationSetupService implements IOrganizationSetupService {
    private notificationService: INotificationService
    private organizationService: OrganizationService

    constructor(
        notificationService: INotificationService = new NotificationService(),
        organizationService: OrganizationService = new OrganizationService()
    ) {
        this.notificationService = notificationService
        this.organizationService = organizationService
    }

    async setupOrganization(payload: OrganizationSetupInput): Promise<IAccountDescriptor> {
        const appServer = getRunningExpressApp()
        let inviteToSend: Invite | null = null

        const account = await appServer.AppDataSource.transaction(async (manager) => {
            const { organization, workspace, role } = await this.organizationService.createOrganization(
                {
                    name: payload.organization?.name,
                    subscriptionId: payload.organization?.subscriptionId,
                    customerId: payload.organization?.customerId,
                    productId: payload.organization?.productId,
                    workspaceId: payload.workspace?.id,
                    workspaceName: payload.workspace?.name,
                    workspaceIsPersonal: payload.workspace?.isPersonal,
                    roleId: payload.role?.id,
                    roleName: payload.role?.name,
                    rolePermissions: payload.role?.permissions
                },
                manager
            )

            if (!workspace || !role) {
                throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Organization defaults are missing')
            }

            const userRepository = manager.getRepository(User)
            const organizationUserRepository = manager.getRepository(OrganizationUser)
            const workspaceUserRepository = manager.getRepository(WorkspaceUser)
            const inviteRepository = manager.getRepository(Invite)

            let user: User | null = null
            const normalizedEmail = payload.user?.email?.trim()
            if (payload.user?.id) {
                user = await userRepository.findOneBy({ id: payload.user.id })
            }
            if (!user && normalizedEmail) {
                user = await userRepository.findOneBy({ email: normalizedEmail })
            }

            if (!user) {
                if (!normalizedEmail) {
                    throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required to setup organization')
                }
                user = await userRepository.save(
                    userRepository.create({
                        email: normalizedEmail,
                        firstName: payload.user?.firstName,
                        lastName: payload.user?.lastName,
                        status: 'PENDING'
                    })
                )
                inviteToSend = await inviteRepository.save(
                    inviteRepository.create(
                        this.buildInvite({
                            email: normalizedEmail,
                            organizationId: organization.id,
                            workspaceId: workspace.id,
                            roleId: role.id
                        })
                    )
                )
            } else if (user.status === 'DISABLED') {
                throw new InternalFlowiseError(StatusCodes.CONFLICT, 'User is disabled')
            } else if (user.status !== 'ACTIVE') {
                inviteToSend = await inviteRepository.save(
                    inviteRepository.create(
                        this.buildInvite({
                            email: user.email,
                            organizationId: organization.id,
                            workspaceId: workspace.id,
                            roleId: role.id
                        })
                    )
                )
            }

            const membershipStatus = user.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING'

            const organizationUser = await organizationUserRepository.save(
                organizationUserRepository.create({
                    organizationId: organization.id,
                    userId: user.id,
                    roleId: role.id,
                    isOwner: true,
                    status: membershipStatus
                })
            )

            const workspaceUser = await workspaceUserRepository.save(
                workspaceUserRepository.create({
                    workspaceId: workspace.id,
                    userId: user.id,
                    roleId: role.id,
                    status: membershipStatus
                })
            )

            return {
                user,
                organization,
                workspaces: [workspace],
                roles: [role],
                organizationUsers: [organizationUser],
                workspaceUsers: [workspaceUser],
                invites: inviteToSend ? [inviteToSend] : []
            }
        })

        if (inviteToSend) {
            await this.notificationService.sendInvite(inviteToSend)
        }

        return account
    }

    private buildInvite(input: Partial<Invite>): Invite {
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
        } as Invite
    }
}

export default OrganizationSetupService
