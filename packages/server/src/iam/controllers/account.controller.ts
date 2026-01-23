import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import AccountService from '../services/account.service'
import {
    AcceptInviteRequestBody,
    CreateInviteRequestBody,
    ForgotPasswordRequestBody,
    GetProfileRequestBody,
    RegisterRequestBody,
    ResetPasswordRequestBody,
    ResendInviteRequestBody,
    UpdateProfileRequestBody
} from '../types/account.requests'
import { AccountNotFoundResponse, AccountResponse, InviteResentResponse } from '../types/account.responses'

export interface IAccountController {
    createInvite(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    registerUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    acceptInvite(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    resendInvite(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    getAccount(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    updateAccount(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class AccountController implements IAccountController {
    private accountService: AccountService

    constructor(accountService: AccountService = new AccountService()) {
        this.accountService = accountService
    }

    async createInvite(
        req: Request,
        res: Response<AccountResponse>,
        next: NextFunction
    ): Promise<Response<AccountResponse> | void> {
        try {
            const body = req.body as CreateInviteRequestBody
            const result = await this.accountService.createInvite({
                user: { email: body.user.email },
                organization: body.organization ? { id: body.organization.id } : undefined,
                workspaces: body.workspace ? [{ id: body.workspace.id }] : undefined,
                workspaceUsers: body.workspace && body.role ? [{ workspaceId: body.workspace.id, roleId: body.role.id }] : undefined,
                organizationUsers: body.organization && body.role ? [{ organizationId: body.organization.id, roleId: body.role.id }] : undefined,
                invites: [
                    {
                        email: body.user.email,
                        organizationId: body.organization?.id,
                        workspaceId: body.workspace?.id,
                        roleId: body.role?.id,
                        expiresAt: body.expiresAt
                    }
                ]
            })
            return res.status(StatusCodes.CREATED).json({ account: result })
        } catch (error) {
            next(error)
        }
    }

    async registerUser(
        req: Request,
        res: Response<AccountResponse>,
        next: NextFunction
    ): Promise<Response<AccountResponse> | void> {
        try {
            const body = req.body as RegisterRequestBody
            const user = this.normalizeRegisterUser(body.user)
            const result = await this.accountService.registerUser({
                user,
                organization: body.organization,
                workspaces: body.workspace ? [body.workspace] : undefined
            })
            return res.status(StatusCodes.CREATED).json({ account: result, message: 'Account registered' })
        } catch (error) {
            next(error)
        }
    }

    async acceptInvite(
        req: Request,
        res: Response<AccountResponse>,
        next: NextFunction
    ): Promise<Response<AccountResponse> | void> {
        try {
            const body = req.body as AcceptInviteRequestBody
            const token = body?.token
            if (!token) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invite token is required')
            }
            const result = await this.accountService.acceptInvite(token, {})
            return res.status(StatusCodes.OK).json({ account: result })
        } catch (error) {
            next(error)
        }
    }

    async resendInvite(
        req: Request,
        res: Response<InviteResentResponse>,
        next: NextFunction
    ): Promise<Response<InviteResentResponse> | void> {
        try {
            const body = req.body as ResendInviteRequestBody
            await this.accountService.resendInvite({
                user: { email: body.user.email },
                organization: body.organization ? { id: body.organization.id } : undefined
            })
            return res.status(StatusCodes.OK).json({ message: 'Invite resent' })
        } catch (error) {
            next(error)
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = req.body as ForgotPasswordRequestBody
            if (!body?.user?.email) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Email is required')
            }
            return res.status(StatusCodes.OK).json({ message: 'If the account exists, a reset email will be sent.' })
        } catch (error) {
            next(error)
        }
    }

    async resetPassword(
        req: Request,
        res: Response<AccountResponse>,
        next: NextFunction
    ): Promise<Response<AccountResponse> | void> {
        try {
            const body = req.body as ResetPasswordRequestBody
            const token = body?.user?.tempToken
            const password = body?.user?.password
            if (!token) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Invite token is required')
            }
            if (!password) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Password is required')
            }
            const result = await this.accountService.setPasswordFromInvite(token, password)
            return res.status(StatusCodes.OK).json({ account: result, message: 'Password set' })
        } catch (error) {
            next(error)
        }
    }

    async getAccount(
        req: Request,
        res: Response<AccountResponse | AccountNotFoundResponse>,
        next: NextFunction
    ): Promise<Response<AccountResponse | AccountNotFoundResponse> | void> {
        try {
            const body = req.body as GetProfileRequestBody
            const result = await this.accountService.getProfile({ user: body.user })
            if (!result) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Account not found' })
            }
            return res.status(StatusCodes.OK).json({ account: result })
        } catch (error) {
            next(error)
        }
    }

    async updateAccount(
        req: Request,
        res: Response<AccountResponse | AccountNotFoundResponse>,
        next: NextFunction
    ): Promise<Response<AccountResponse | AccountNotFoundResponse> | void> {
        try {
            const body = req.body as UpdateProfileRequestBody
            const result = await this.accountService.updateProfile({ user: body.user })
            if (!result) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Account not found' })
            }
            return res.status(StatusCodes.OK).json({ account: result })
        } catch (error) {
            next(error)
        }
    }

    private normalizeRegisterUser(user?: RegisterRequestBody['user']) {
        if (!user) {
            return {}
        }
        if (user.firstName || user.lastName) {
            return user
        }
        const name = user.name?.trim()
        if (!name) {
            return user
        }
        const parts = name.split(/\s+/)
        return {
            ...user,
            firstName: parts[0],
            lastName: parts.slice(1).join(' ') || undefined
        }
    }
}

export default AccountController
