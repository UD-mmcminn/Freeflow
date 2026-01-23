import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { clearAuthCookies } from '../middleware/passport/auth.cookies'
import getAuthConfig from '../middleware/passport/auth.config'
import { LoggedInUser } from '../Interface.Iam'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import LoginSessionService from '../services/login-session.service'
import { ListLoginSessionsQuery } from '../types/login-session.requests'
import {
    LoginSessionDeletedResponse,
    LoginSessionListResponse,
    LoginSessionNotFoundResponse,
    LoginSessionResponse
} from '../types/login-session.responses'

export interface ILoginSessionController {
    listLoginSessions(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    getLoginSession(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    revokeLoginSession(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class LoginSessionController implements ILoginSessionController {
    private sessionService: LoginSessionService

    constructor(sessionService: LoginSessionService = new LoginSessionService()) {
        this.sessionService = sessionService
    }

    async listLoginSessions(
        req: Request,
        res: Response<LoginSessionListResponse>,
        next: NextFunction
    ): Promise<Response<LoginSessionListResponse> | void> {
        try {
            const query = req.query as ListLoginSessionsQuery
            const sessionUser = req.user as LoggedInUser | undefined
            const userId = query?.userId ?? sessionUser?.id
            if (!userId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id is required')
            }
            const sessions = await this.sessionService.listSessions(userId)
            return res.status(StatusCodes.OK).json({ sessions })
        } catch (error) {
            next(error)
        }
    }

    async getLoginSession(
        req: Request,
        res: Response<LoginSessionResponse | LoginSessionNotFoundResponse>,
        next: NextFunction
    ): Promise<Response<LoginSessionResponse | LoginSessionNotFoundResponse> | void> {
        try {
            const sessionId = req.params?.sessionId
            if (!sessionId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session id is required')
            }
            const sessionUser = req.user as LoggedInUser | undefined
            const session = await this.sessionService.getSessionById(sessionId)
            if (!session) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Session not found' })
            }
            if (sessionUser?.id && session.userId !== sessionUser.id) {
                return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
            }
            return res.status(StatusCodes.OK).json({ session })
        } catch (error) {
            next(error)
        }
    }

    async revokeLoginSession(
        req: Request,
        res: Response<LoginSessionDeletedResponse>,
        next: NextFunction
    ): Promise<Response<LoginSessionDeletedResponse> | void> {
        try {
            const sessionId = req.params?.sessionId
            if (!sessionId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session id is required')
            }
            const refreshCookieName = getAuthConfig().cookies.refreshTokenName
            const refreshToken = req.cookies?.[refreshCookieName]
            let shouldClearCookies = false
            const sessionUser = req.user as LoggedInUser | undefined
            const appServer = getRunningExpressApp()
            await appServer.AppDataSource.transaction(async (manager) => {
                const session = await this.sessionService.getSessionById(sessionId, manager)
                if (!session) {
                    throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Session not found')
                }
                if (sessionUser?.id && session.userId !== sessionUser.id) {
                    throw new InternalFlowiseError(StatusCodes.FORBIDDEN, 'Forbidden')
                }
                if (refreshToken) {
                    const currentSession = await this.sessionService.getSessionByRefreshToken(refreshToken, manager)
                    shouldClearCookies = currentSession?.id === sessionId
                }
                await this.sessionService.revokeSession(sessionId, manager)
            })

            if (shouldClearCookies) {
                clearAuthCookies(res)
                if (req.session) {
                    req.session.destroy(() => undefined)
                }
            }
            return res.status(StatusCodes.OK).json({ message: 'Session revoked' })
        } catch (error) {
            next(error)
        }
    }
}

export default LoginSessionController
