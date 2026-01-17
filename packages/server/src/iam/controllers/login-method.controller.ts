import { Request, Response } from 'express'

export interface ILoginMethodController {
    getLoginMethods(req: Request, res: Response): Promise<Response>
    updateLoginMethod(req: Request, res: Response): Promise<Response>
    createLoginMethod(req: Request, res: Response): Promise<Response>
    deleteLoginMethod(req: Request, res: Response): Promise<Response>
}

export class LoginMethodController implements ILoginMethodController {
    async getLoginMethods(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateLoginMethod(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async createLoginMethod(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async deleteLoginMethod(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default LoginMethodController
