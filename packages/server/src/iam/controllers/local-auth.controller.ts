/*
 * Copyright (c) 2026 Union Dynamic, Inc
 *
 * This source code is licensed under the "IAM Module License" (AGPLv3 + AI Clause).
 * You may not use this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the LICENSE file in this directory for the full license text and
 * restrictions regarding Artificial Intelligence training.
 */

import { NextFunction, Request, Response } from 'express'
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
    setPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    verifyPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    changePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class LocalAuthController implements ILocalAuthController {
    private localAuthService: LocalAuthService

    constructor(localAuthService: LocalAuthService = new LocalAuthService()) {
        this.localAuthService = localAuthService
    }

    async setPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
            next(error)
        }
    }

    async verifyPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
            next(error)
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
            next(error)
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = req.body as ChangePasswordRequestBody
            if (!body?.currentPassword || !body?.newPassword) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Current and new passwords are required')
            }
            const userId = await this.resolveUserId(body?.userId, body?.email)
            await this.localAuthService.changePassword(userId, body.currentPassword, body.newPassword)
            return res.status(StatusCodes.OK).json({ message: 'Password updated' })
        } catch (error) {
            next(error)
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

}

export default LocalAuthController
