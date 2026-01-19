import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { User } from '../database/entities/user.entity'
import LocalAuthService from '../services/local-auth.service'
import {
    ChangePasswordRequestBody,
    ResetPasswordRequestBody,
    SetPasswordRequestBody,
    VerifyPasswordRequestBody
} from '../types/local-auth.requests'

export interface ILocalAuthController {
    setPassword(req: Request, res: Response): Promise<Response>
    verifyPassword(req: Request, res: Response): Promise<Response>
    resetPassword(req: Request, res: Response): Promise<Response>
    changePassword(req: Request, res: Response): Promise<Response>
}

export class LocalAuthController implements ILocalAuthController {
    private localAuthService: LocalAuthService

    constructor(localAuthService: LocalAuthService = new LocalAuthService()) {
        this.localAuthService = localAuthService
    }

    async setPassword(req: Request, res: Response): Promise<Response> {
        try {
            const body = req.body as SetPasswordRequestBody
            const password = body?.password
            if (!password) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Password is required')
            }
            const userId = await this.resolveUserId(body?.userId, body?.email)
            await this.localAuthService.setPassword(userId, password)
            return res.status(StatusCodes.OK).json({ message: 'Password set' })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async verifyPassword(req: Request, res: Response): Promise<Response> {
        try {
            const body = req.body as VerifyPasswordRequestBody
            const password = body?.password
            if (!password) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Password is required')
            }
            const userId = await this.resolveUserId(body?.userId, body?.email)
            const valid = await this.localAuthService.verifyPassword(userId, password)
            return res.status(StatusCodes.OK).json({ valid })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async resetPassword(req: Request, res: Response): Promise<Response> {
        try {
            const body = req.body as ResetPasswordRequestBody
            const token = body?.token
            const password = body?.password
            if (!token) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Token is required')
            }
            if (!password) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Password is required')
            }
            await this.localAuthService.resetPassword(token, password)
            return res.status(StatusCodes.OK).json({ message: 'Password updated' })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    async changePassword(req: Request, res: Response): Promise<Response> {
        try {
            const body = req.body as ChangePasswordRequestBody
            if (!body?.currentPassword || !body?.newPassword) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Current and new passwords are required')
            }
            const userId = await this.resolveUserId(body?.userId, body?.email)
            await this.localAuthService.changePassword(userId, body.currentPassword, body.newPassword)
            return res.status(StatusCodes.OK).json({ message: 'Password updated' })
        } catch (error) {
            return this.handleError(res, error)
        }
    }

    private async resolveUserId(userId?: string, email?: string): Promise<string> {
        if (userId) return userId
        if (!email) {
            throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'User id or email is required')
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => {
            const userRepository = manager.getRepository(User)
            const user = await userRepository.findOneBy({ email })
            if (!user) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'User not found')
            }
            return user.id
        })
    }

    private handleError(res: Response, error: unknown): Response {
        if (error instanceof InternalFlowiseError) {
            return res.status(error.statusCode).json({ message: error.message })
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' })
    }
}

export default LocalAuthController
