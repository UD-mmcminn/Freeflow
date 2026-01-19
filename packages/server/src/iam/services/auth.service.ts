import { randomUUID } from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { LoginSession } from '../database/entities/login-session.entity'
import { User } from '../database/entities/user.entity'
import { LoginResponse, RefreshTokenResponse } from '../types/auth.responses'
import { ILocalAuthService, LocalAuthService } from './local-auth.service'

export interface IAuthService {
    login(payload: { userId?: string; email?: string; password?: string }): Promise<LoginResponse>
    logout(sessionToken: string): Promise<void>
    refreshToken(refreshToken: string): Promise<RefreshTokenResponse>
    startSsoLogin(provider: string): Promise<any>
    handleSsoCallback(provider: string, payload: any): Promise<any>
    logoutSso(sessionToken: string): Promise<void>
}

export class AuthService implements IAuthService {
    private localAuthService: ILocalAuthService

    constructor(localAuthService: ILocalAuthService = new LocalAuthService()) {
        this.localAuthService = localAuthService
    }

    async login(payload: { userId?: string; email?: string; password?: string }): Promise<LoginResponse> {
        if (!payload.userId && !payload.email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required')
        }
        if (payload.email && !payload.password) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Password is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const userRepository = manager.getRepository(User)
            const sessionRepository = manager.getRepository(LoginSession)

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

            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            const session = await sessionRepository.save(
                sessionRepository.create({
                    userId: user.id,
                    sessionToken: randomUUID(),
                    refreshToken: randomUUID(),
                    expiresAt
                })
            )

            return { session }
        })
    }

    async logout(sessionToken: string): Promise<void> {
        if (!sessionToken) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session token is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const sessionRepository = manager.getRepository(LoginSession)
            await sessionRepository.delete({ sessionToken })
        })
    }

    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        if (!refreshToken) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Refresh token is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const sessionRepository = manager.getRepository(LoginSession)
            const session = await sessionRepository.findOneBy({ refreshToken })
            if (!session) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Session not found')
            }

            session.sessionToken = randomUUID()
            session.refreshToken = randomUUID()
            session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            const updated = await sessionRepository.save(session)
            return { session: updated }
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
}

export default AuthService
