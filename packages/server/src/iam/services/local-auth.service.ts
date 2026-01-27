import { randomUUID } from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Invite } from '../database/entities/invite.entity'
import { UserCredential } from '../database/entities/user-credential.entity'
import { User } from '../database/entities/user.entity'
import { compareHash, getHash } from '../utils/encryption.util'

const LOCAL_PROVIDER = 'local'

export interface ILocalAuthService {
    setPassword(userId: string, password: string): Promise<void>
    verifyPassword(userId: string, password: string): Promise<boolean>
    resetPassword(token: string, newPassword: string): Promise<void>
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>
    createResetToken(userId: string): Promise<{ token: string; expiresAt: number }>
    createResetTokenWithManager(manager: any, userId: string): Promise<{ token: string; expiresAt: number }>
}

export class LocalAuthService implements ILocalAuthService {
    async setPassword(userId: string, password: string): Promise<void> {
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id is required')
        }
        if (!password) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Password is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            await this.setPasswordWithManager(manager, userId, password)
        })
    }

    async verifyPassword(userId: string, password: string): Promise<boolean> {
        if (!userId || !password) return false
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const credentialRepository = manager.getRepository(UserCredential)
            const credential = await credentialRepository.findOneBy({ userId, provider: LOCAL_PROVIDER })
            if (!credential?.passwordHash) return false
            return compareHash(password, credential.passwordHash)
        })
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        if (!token) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Token is required')
        }
        if (!newPassword) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Password is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const credentialRepository = manager.getRepository(UserCredential)
            const userRepository = manager.getRepository(User)
            const inviteRepository = manager.getRepository(Invite)

            const credential = await credentialRepository.findOne({ where: { tempToken: token } })
            if (credential?.userId) {
                if (credential.tokenExpiry && credential.tokenExpiry < Date.now()) {
                    throw new InternalFlowiseError(StatusCodes.GONE, 'Token expired')
                }
                await this.setPasswordWithManager(manager, credential.userId, newPassword)
                return
            }

            const invite = await inviteRepository.findOneBy({ token })
            if (!invite) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Token not found')
            }
            if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
                throw new InternalFlowiseError(StatusCodes.GONE, 'Token expired')
            }

            const user = await userRepository.findOneBy({ email: invite.email })
            if (!user) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not found')
            }

            await this.setPasswordWithManager(manager, user.id, newPassword)
        })
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id is required')
        }
        if (!currentPassword || !newPassword) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Current and new passwords are required')
        }
        const isValid = await this.verifyPassword(userId, currentPassword)
        if (!isValid) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Invalid credentials')
        }
        await this.setPassword(userId, newPassword)
    }

    async createResetToken(userId: string): Promise<{ token: string; expiresAt: number }> {
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            return this.createResetTokenWithManager(manager, userId)
        })
    }

    async createResetTokenWithManager(manager: any, userId: string): Promise<{ token: string; expiresAt: number }> {
        const credentialRepository = manager.getRepository(UserCredential)
        const token = randomUUID()
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
        const existing = await credentialRepository.findOneBy({ userId, provider: LOCAL_PROVIDER })
        if (existing) {
            existing.tempToken = token
            existing.tokenExpiry = expiresAt
            await credentialRepository.save(existing)
            return { token, expiresAt }
        }
        await credentialRepository.save(
            credentialRepository.create({
                userId,
                provider: LOCAL_PROVIDER,
                tempToken: token,
                tokenExpiry: expiresAt
            })
        )
        return { token, expiresAt }
    }

    private async setPasswordWithManager(manager: any, userId: string, password: string): Promise<void> {
        const credentialRepository = manager.getRepository(UserCredential)
        const hash = await getHash(password)
        const existing = await credentialRepository.findOneBy({ userId, provider: LOCAL_PROVIDER })
        if (existing) {
            existing.passwordHash = hash
            existing.tempToken = null
            existing.tokenExpiry = null
            await credentialRepository.save(existing)
            return
        }
        await credentialRepository.save(
            credentialRepository.create({
                userId,
                provider: LOCAL_PROVIDER,
                passwordHash: hash
            })
        )
    }
}

export default LocalAuthService
