import { Request, Response } from 'express'

export interface IAccountController {
    registerUser(req: Request, res: Response): Promise<Response>
    acceptInvite(req: Request, res: Response): Promise<Response>
    resendInvite(req: Request, res: Response): Promise<Response>
    sendVerificationEmail(req: Request, res: Response): Promise<Response>
    verifyEmail(req: Request, res: Response): Promise<Response>
    resendVerificationEmail(req: Request, res: Response): Promise<Response>
    getAccount(req: Request, res: Response): Promise<Response>
    updateAccount(req: Request, res: Response): Promise<Response>
}

export class AccountController implements IAccountController {
    async registerUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async acceptInvite(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async resendInvite(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async sendVerificationEmail(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async verifyEmail(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async resendVerificationEmail(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async getAccount(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateAccount(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default AccountController
