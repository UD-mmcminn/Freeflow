import { In } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { OrganizationUser } from '../database/entities/organization-user.entity'
import { User } from '../database/entities/user.entity'
import { Workspace } from '../database/entities/workspace.entity'
import { WorkspaceUser } from '../database/entities/workspace-user.entity'
import { ILoginSessionService, LoginSessionService } from './login-session.service'

export interface IOrganizationUserService {
    listOrganizationUsers(filters?: { organizationId?: string; userId?: string }): Promise<OrganizationUser[]>
    getOrganizationUserById(organizationUserId: string): Promise<OrganizationUser | null>
    createOrganizationUser(payload: any): Promise<OrganizationUser>
    updateOrganizationUser(payload: {
        organizationId: string
        userId: string
        status?: string
        roleId?: string
        isOwner?: boolean
    }): Promise<OrganizationUser | null>
    deleteOrganizationUser(organizationId: string, userId: string): Promise<void>
}

export class OrganizationUserService implements IOrganizationUserService {
    private loginSessionService: ILoginSessionService

    constructor(loginSessionService: ILoginSessionService = new LoginSessionService()) {
        this.loginSessionService = loginSessionService
    }

    async listOrganizationUsers(filters?: { organizationId?: string; userId?: string }): Promise<OrganizationUser[]> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(OrganizationUser)
            const where: { organizationId?: string; userId?: string } = {}
            if (filters?.organizationId) where.organizationId = filters.organizationId
            if (filters?.userId) where.userId = filters.userId
            return repository.find({
                where: Object.keys(where).length ? where : undefined,
                relations: ['organization', 'user', 'role']
            })
        })
    }

    async getOrganizationUserById(_organizationUserId: string): Promise<OrganizationUser | null> {
        return null
    }

    async createOrganizationUser(_payload: any): Promise<OrganizationUser> {
        return null as unknown as OrganizationUser
    }

    async updateOrganizationUser(payload: {
        organizationId: string
        userId: string
        status?: string
        roleId?: string
        isOwner?: boolean
    }): Promise<OrganizationUser | null> {
        if (!payload.organizationId || !payload.userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id and user id are required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(OrganizationUser)
            const userRepository = manager.getRepository(User)
            const orgUser = await repository.findOneBy({
                organizationId: payload.organizationId,
                userId: payload.userId
            })
            if (!orgUser) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Organization user not found')
            }

            const normalizedStatus = this.normalizeStatus(payload.status)
            if (normalizedStatus) {
                orgUser.status = normalizedStatus
            }
            if (payload.roleId !== undefined) {
                orgUser.roleId = payload.roleId
            }
            if (payload.isOwner !== undefined) {
                orgUser.isOwner = payload.isOwner
            }

            const updated = await repository.save(orgUser)
            if (normalizedStatus) {
                const user = await userRepository.findOneBy({ id: payload.userId })
                if (user) {
                    if (normalizedStatus === 'DISABLED') {
                        user.status = 'DISABLED'
                        await userRepository.save(user)
                        await this.loginSessionService.revokeSessionsByUserId(user.id, manager)
                    } else if (normalizedStatus === 'ACTIVE' && user.status !== 'ACTIVE') {
                        user.status = 'ACTIVE'
                        await userRepository.save(user)
                    }
                }
            }
            return updated
        })
    }

    async deleteOrganizationUser(organizationId: string, userId: string): Promise<void> {
        if (!organizationId || !userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Organization id and user id are required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const repository = manager.getRepository(OrganizationUser)
            const workspaceRepository = manager.getRepository(Workspace)
            const workspaceUserRepository = manager.getRepository(WorkspaceUser)
            const userRepository = manager.getRepository(User)

            const orgUser = await repository.findOneBy({ organizationId, userId })
            if (!orgUser) {
                return
            }

            const workspaces = await workspaceRepository.findBy({ organizationId })
            const workspaceIds = workspaces.map((workspace) => workspace.id)
            if (workspaceIds.length) {
                await workspaceUserRepository.delete({ userId, workspaceId: In(workspaceIds) })
            }

            await repository.delete({ organizationId, userId })

            const remaining = await repository.count({ where: { userId } })
            if (remaining === 0) {
                const user = await userRepository.findOneBy({ id: userId })
                if (user) {
                    user.status = 'DISABLED'
                    await userRepository.save(user)
                    await this.loginSessionService.revokeSessionsByUserId(user.id, manager)
                }
            }
        })
    }

    private normalizeStatus(status?: string): OrganizationUser['status'] | undefined {
        if (!status) return undefined
        const normalized = status.trim().toUpperCase()
        if (normalized === 'INACTIVE' || normalized === 'DISABLED') return 'DISABLED'
        if (normalized === 'INVITED' || normalized === 'PENDING') return 'PENDING'
        if (normalized === 'ACTIVE') return 'ACTIVE'
        throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invalid organization user status')
    }
}
export default OrganizationUserService
