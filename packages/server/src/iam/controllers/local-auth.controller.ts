import { Request, Response } from 'express'

export interface ILocalAuthController {
    setPassword(req: Request, res: Response): Promise<Response>
    verifyPassword(req: Request, res: Response): Promise<Response>
    resetPassword(req: Request, res: Response): Promise<Response>
    changePassword(req: Request, res: Response): Promise<Response>
}

export class LocalAuthController implements ILocalAuthController {
    async setPassword(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async verifyPassword(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async resetPassword(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async changePassword(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default LocalAuthController
