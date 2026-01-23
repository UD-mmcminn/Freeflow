import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { clearAuthCookies, setAuthCookies } from '../middleware/passport/auth.cookies'
import getAuthConfig from '../middleware/passport/auth.config'
import Permissions from '../rbac/Permissions'
import AuthService from '../services/auth.service'
import { LoginRequestBody, LogoutRequestBody, RefreshTokenRequestBody } from '../types/auth.requests'
import { AuthPayload, LogoutResponse } from '../types/auth.responses'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

export interface IAuthController {
    resolveLogin(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    login(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    logout(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    getPermissions(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class AuthController implements IAuthController {
    private authService: AuthService

    constructor(authService: AuthService = new AuthService()) {
        this.authService = authService
    }

    async resolveLogin(_req: Request, res: Response, _next: NextFunction): Promise<Response> {
        return res.status(StatusCodes.OK).json({ redirectUrl: '/signin' })
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<Response<AuthPayload> | void> {
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
            if (!result.payload) {
                throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Login payload is missing')
            }
            return res.status(StatusCodes.OK).json(result.payload)
        } catch (error) {
            next(error)
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<Response<LogoutResponse> | void> {
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
            next(error)
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response<AuthPayload> | void> {
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
            if (!result.payload) {
                throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Refresh payload is missing')
            }
            return res.status(StatusCodes.OK).json(result.payload)
        } catch (error) {
            next(error)
        }
    }

    async getPermissions(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const identityManager = getRunningExpressApp()?.identityManager
            const permissionsProvider = identityManager?.getPermissions
                ? identityManager.getPermissions()
                : new Permissions()
            const permissions = permissionsProvider.getAllPermissions()
            return res.status(StatusCodes.OK).json(permissions)
        } catch (error) {
            next(error)
        }
    }
}

export default AuthController
