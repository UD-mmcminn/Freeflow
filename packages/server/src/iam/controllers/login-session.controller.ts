import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import LoginSessionService from '../services/login-session.service'
import { ListLoginSessionsQuery } from '../types/login-session.requests'
import {
    LoginSessionDeletedResponse,
    LoginSessionListResponse,
    LoginSessionNotFoundResponse,
    LoginSessionResponse
} from '../types/login-session.responses'

export interface ILoginSessionController {
    listLoginSessions(req: Request, res: Response): Promise<Response>
    getLoginSession(req: Request, res: Response): Promise<Response>
    revokeLoginSession(req: Request, res: Response): Promise<Response>
}

export class LoginSessionController implements ILoginSessionController {
    private sessionService: LoginSessionService

    constructor(sessionService: LoginSessionService = new LoginSessionService()) {
        this.sessionService = sessionService
    }

    async listLoginSessions(req: Request, res: Response<LoginSessionListResponse>): Promise<Response<LoginSessionListResponse>> {
        try {
            const query = req.query as ListLoginSessionsQuery
            const userId = query?.userId
            const sessions = await this.sessionService.listSessions(userId)
            return res.status(StatusCodes.OK).json({ sessions })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async getLoginSession(
        req: Request,
        res: Response<LoginSessionResponse | LoginSessionNotFoundResponse>
    ): Promise<Response<LoginSessionResponse | LoginSessionNotFoundResponse>> {
        try {
            const sessionId = req.params?.sessionId
            if (!sessionId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session id is required')
            }
            const session = await this.sessionService.getSessionById(sessionId)
            if (!session) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Session not found' })
            }
            return res.status(StatusCodes.OK).json({ session })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async revokeLoginSession(
        req: Request,
        res: Response<LoginSessionDeletedResponse>
    ): Promise<Response<LoginSessionDeletedResponse>> {
        try {
            const sessionId = req.params?.sessionId
            if (!sessionId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session id is required')
            }
            await this.sessionService.revokeSession(sessionId)
            return res.status(StatusCodes.OK).json({ message: 'Session revoked' })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    private handleError(res: Response, error: unknown): Response {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ message: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' })
    }
}

export default LoginSessionController
