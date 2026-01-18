import { randomUUID } from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { LoginSession } from '../database/entities/login-session.entity'

export interface ILoginSessionService {
    listSessions(userId?: string): Promise<LoginSession[]>
    getSessionById(sessionId: string): Promise<LoginSession | null>
    createSession(payload: {
        userId: string
        sessionToken?: string
        refreshToken?: string
        expiresAt?: Date
    }): Promise<LoginSession>
    revokeSession(sessionId: string): Promise<void>
}

export class LoginSessionService implements ILoginSessionService {
    async listSessions(userId?: string): Promise<LoginSession[]> {
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const sessionRepository = manager.getRepository(LoginSession)
            if (userId) {
                return sessionRepository.find({ where: { userId } })
            }
            return sessionRepository.find()
        })
    }

    async getSessionById(sessionId: string): Promise<LoginSession | null> {
        if (!sessionId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session id is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const sessionRepository = manager.getRepository(LoginSession)
            return sessionRepository.findOneBy({ id: sessionId })
        })
    }

    async createSession(payload: {
        userId: string
        sessionToken?: string
        refreshToken?: string
        expiresAt?: Date
    }): Promise<LoginSession> {
        if (!payload.userId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id is required to create a session')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const sessionRepository = manager.getRepository(LoginSession)
            const session = sessionRepository.create({
                userId: payload.userId,
                sessionToken: payload.sessionToken ?? randomUUID(),
                refreshToken: payload.refreshToken ?? randomUUID(),
                expiresAt: payload.expiresAt
            })
            return sessionRepository.save(session)
        })
    }

    async revokeSession(sessionId: string): Promise<void> {
        if (!sessionId) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session id is required')
        }
        const appServer = getRunningExpressApp()
        await appServer.AppDataSource.transaction(async (manager) => {
            const sessionRepository = manager.getRepository(LoginSession)
            await sessionRepository.delete({ id: sessionId })
        })
    }
}
export default LoginSessionService
