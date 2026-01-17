import { Request, Response } from 'express'

export interface ILoginSessionController {
    listLoginSessions(req: Request, res: Response): Promise<Response>
    getLoginSession(req: Request, res: Response): Promise<Response>
    revokeLoginSession(req: Request, res: Response): Promise<Response>
}

export class LoginSessionController implements ILoginSessionController {
    async listLoginSessions(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async getLoginSession(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async revokeLoginSession(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default LoginSessionController
