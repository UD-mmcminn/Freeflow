import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { clearAuthCookies, setAuthCookies } from '../middleware/passport/auth.cookies'
import getAuthConfig from '../middleware/passport/auth.config'
import AuthService from '../services/auth.service'
import { LoginRequestBody, LogoutRequestBody, RefreshTokenRequestBody } from '../types/auth.requests'
import { LoginResponse, LogoutResponse, RefreshTokenResponse } from '../types/auth.responses'

export interface IAuthController {
    resolveLogin(req: Request, res: Response): Promise<Response>
    login(req: Request, res: Response): Promise<Response>
    logout(req: Request, res: Response): Promise<Response>
    refreshToken(req: Request, res: Response): Promise<Response>
}

export class AuthController implements IAuthController {
    private authService: AuthService

    constructor(authService: AuthService = new AuthService()) {
        this.authService = authService
    }

    async resolveLogin(_req: Request, res: Response): Promise<Response> {
        return res.status(StatusCodes.OK).json({ redirectUrl: '/signin' })
    }

    async login(req: Request, res: Response): Promise<Response<LoginResponse>> {
        try {
            const body = (req.body ?? {}) as LoginRequestBody
            const result = await this.authService.login(body)
            if (req.session?.regenerate) {
                await new Promise<void>((resolve, reject) => {
                    req.session.regenerate((err) => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
            }
            if (req.login && result.user) {
                await new Promise<void>((resolve, reject) => {
                    req.login(result.user, (err) => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
            }
            if (req.session?.save) {
                await new Promise<void>((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
            }
            if (result.accessToken && result.refreshToken) {
                setAuthCookies(res, result.accessToken, result.refreshToken)
            }
            return res.status(StatusCodes.OK).json({ session: result.session })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async logout(req: Request, res: Response): Promise<Response<LogoutResponse>> {
        try {
            const body = req.body as LogoutRequestBody
            const sessionToken = body?.sessionToken
            if (!sessionToken) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Session token is required')
            }
            await this.authService.logout(sessionToken)
            clearAuthCookies(res)
            if (req.logout) {
                req.logout(() => undefined)
            }
            if (req.session) {
                req.session.destroy(() => undefined)
            }
            return res.status(StatusCodes.OK).json({ message: 'logged_out', redirectTo: '/login' })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async refreshToken(req: Request, res: Response): Promise<Response<RefreshTokenResponse>> {
        try {
            const body = req.body as RefreshTokenRequestBody
            const refreshToken = body?.refreshToken ?? req.cookies?.[getAuthConfig().cookies.refreshTokenName]
            if (!refreshToken) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Refresh token is required')
            }
            const result = await this.authService.refreshToken(refreshToken)
            if (result.accessToken && result.refreshToken) {
                setAuthCookies(res, result.accessToken, result.refreshToken)
            }
            return res.status(StatusCodes.OK).json({ session: result.session })
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

export default AuthController
