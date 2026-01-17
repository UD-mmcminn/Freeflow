import { Request, Response } from 'express'

export interface IAccountController {
    getAccount(req: Request, res: Response): Promise<Response>
    updateAccount(req: Request, res: Response): Promise<Response>
    resetPassword(req: Request, res: Response): Promise<Response>
}

export class AccountController implements IAccountController {
    async getAccount(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateAccount(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async resetPassword(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default AccountController
