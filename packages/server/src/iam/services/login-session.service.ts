import { randomUUID } from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { LoginSession } from '../database/entities/login-session.entity'

export interface ILoginSessionService {
    listSessions(userId?: string, manager?: any): Promise<LoginSession[]>
    getSessionById(sessionId: string, manager?: any): Promise<LoginSession | null>
    getSessionByToken(sessionToken: string, manager?: any): Promise<LoginSession | null>
    getSessionByRefreshToken(refreshToken: string, manager?: any): Promise<LoginSession | null>
    createSession(payload: {
        userId: string
        sessionToken?: string
        refreshToken?: string
        expiresAt?: Date
    }, manager?: any): Promise<LoginSession>
    rotateSessionTokens(
        session: LoginSession,
        payload?: { sessionToken?: string; refreshToken?: string; expiresAt?: Date },
        manager?: any
    ): Promise<LoginSession>
    revokeSession(sessionId: string, manager?: any): Promise<void>
    revokeSessionByToken(sessionToken: string, manager?: any): Promise<void>
    revokeSessionsByUserId(userId: string, manager?: any): Promise<void>
}

export class LoginSessionService implements ILoginSessionService {
    async listSessions(userId?: string, manager?: any): Promise<LoginSession[]> {
        const appServer = getRunningExpressApp()
        if (manager) {
            const sessionRepository = manager.getRepository(LoginSession)
            return userId ? sessionRepository.find({ where: { userId } }) : sessionRepository.find()
        }
        return appServer.AppDataSource.transaction(async (transactionManager) => {
            const sessionRepository = transactionManager.getRepository(LoginSession)
            if (userId) {
                return sessionRepository.find({ where: { userId } })
            }
            return sessionRepository.find()
        })
    }

    async getSessionById(sessionId: string, manager?: any): Promise<LoginSession | null> {
        if (!sessionId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session id is required')
        }
        const appServer = getRunningExpressApp()
        if (manager) {
            const sessionRepository = manager.getRepository(LoginSession)
            return sessionRepository.findOneBy({ id: sessionId })
        }
        return appServer.AppDataSource.transaction(async (transactionManager) => {
            const sessionRepository = transactionManager.getRepository(LoginSession)
            return sessionRepository.findOneBy({ id: sessionId })
        })
    }

    async getSessionByToken(sessionToken: string, manager?: any): Promise<LoginSession | null> {
        if (!sessionToken) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session token is required')
        }
        const appServer = getRunningExpressApp()
        if (manager) {
            const sessionRepository = manager.getRepository(LoginSession)
            return sessionRepository.findOneBy({ sessionToken })
        }
        return appServer.AppDataSource.transaction(async (transactionManager) => {
            const sessionRepository = transactionManager.getRepository(LoginSession)
            return sessionRepository.findOneBy({ sessionToken })
        })
    }

    async getSessionByRefreshToken(refreshToken: string, manager?: any): Promise<LoginSession | null> {
        if (!refreshToken) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Refresh token is required')
        }
        const appServer = getRunningExpressApp()
        if (manager) {
            const sessionRepository = manager.getRepository(LoginSession)
            return sessionRepository.findOneBy({ refreshToken })
        }
        return appServer.AppDataSource.transaction(async (transactionManager) => {
            const sessionRepository = transactionManager.getRepository(LoginSession)
            return sessionRepository.findOneBy({ refreshToken })
        })
    }

    async createSession(payload: {
        userId: string
        sessionToken?: string
        refreshToken?: string
        expiresAt?: Date
    }, manager?: any): Promise<LoginSession> {
        if (!payload.userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id is required to create a session')
        }
        const appServer = getRunningExpressApp()
        if (manager) {
            const sessionRepository = manager.getRepository(LoginSession)
            const session = sessionRepository.create({
                userId: payload.userId,
                sessionToken: payload.sessionToken ?? randomUUID(),
                refreshToken: payload.refreshToken ?? randomUUID(),
                expiresAt: payload.expiresAt
            })
            return sessionRepository.save(session)
        }
        return appServer.AppDataSource.transaction(async (transactionManager) => {
            const sessionRepository = transactionManager.getRepository(LoginSession)
            const session = sessionRepository.create({
                userId: payload.userId,
                sessionToken: payload.sessionToken ?? randomUUID(),
                refreshToken: payload.refreshToken ?? randomUUID(),
                expiresAt: payload.expiresAt
            })
            return sessionRepository.save(session)
        })
    }

    async rotateSessionTokens(
        session: LoginSession,
        payload?: { sessionToken?: string; refreshToken?: string; expiresAt?: Date },
        manager?: any
    ): Promise<LoginSession> {
        if (!session?.id) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session is required to rotate tokens')
        }
        const appServer = getRunningExpressApp()
        const updates = {
            sessionToken: payload?.sessionToken ?? randomUUID(),
            refreshToken: payload?.refreshToken ?? randomUUID(),
            expiresAt: payload?.expiresAt ?? session.expiresAt
        }
        if (manager) {
            const sessionRepository = manager.getRepository(LoginSession)
            const updated = sessionRepository.merge(session, updates)
            return sessionRepository.save(updated)
        }
        return appServer.AppDataSource.transaction(async (transactionManager) => {
            const sessionRepository = transactionManager.getRepository(LoginSession)
            const updated = sessionRepository.merge(session, updates)
            return sessionRepository.save(updated)
        })
    }

    async revokeSession(sessionId: string, manager?: any): Promise<void> {
        if (!sessionId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session id is required')
        }
        const appServer = getRunningExpressApp()
        if (manager) {
            const sessionRepository = manager.getRepository(LoginSession)
            await sessionRepository.delete({ id: sessionId })
            return
        }
        await appServer.AppDataSource.transaction(async (transactionManager) => {
            const sessionRepository = transactionManager.getRepository(LoginSession)
            await sessionRepository.delete({ id: sessionId })
        })
    }

    async revokeSessionByToken(sessionToken: string, manager?: any): Promise<void> {
        if (!sessionToken) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session token is required')
        }
        const appServer = getRunningExpressApp()
        if (manager) {
            const sessionRepository = manager.getRepository(LoginSession)
            await sessionRepository.delete({ sessionToken })
            return
        }
        await appServer.AppDataSource.transaction(async (transactionManager) => {
            const sessionRepository = transactionManager.getRepository(LoginSession)
            await sessionRepository.delete({ sessionToken })
        })
    }

    async revokeSessionsByUserId(userId: string, manager?: any): Promise<void> {
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id is required')
        }
        const appServer = getRunningExpressApp()
        if (manager) {
            const sessionRepository = manager.getRepository(LoginSession)
            await sessionRepository.delete({ userId })
            return
        }
        await appServer.AppDataSource.transaction(async (transactionManager) => {
            const sessionRepository = transactionManager.getRepository(LoginSession)
            await sessionRepository.delete({ userId })
        })
    }
}
export default LoginSessionService
