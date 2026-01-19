import { randomUUID } from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { User } from '../database/entities/user.entity'
import { LoginResponse, RefreshTokenResponse } from '../types/auth.responses'
import { ILoginSessionService, LoginSessionService } from './login-session.service'
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
    private loginSessionService: ILoginSessionService

    constructor(
        localAuthService: ILocalAuthService = new LocalAuthService(),
        loginSessionService: ILoginSessionService = new LoginSessionService()
    ) {
        this.localAuthService = localAuthService
        this.loginSessionService = loginSessionService
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
            const session = await this.loginSessionService.createSession(
                {
                    userId: user.id,
                    sessionToken: randomUUID(),
                    refreshToken: randomUUID(),
                    expiresAt
                },
                manager
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
            await this.loginSessionService.revokeSessionByToken(sessionToken, manager)
        })
    }

    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        if (!refreshToken) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Refresh token is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
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

            const updated = await this.loginSessionService.rotateSessionTokens(
                session,
                {
                    sessionToken: randomUUID(),
                    refreshToken: randomUUID(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                },
                manager
            )
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
