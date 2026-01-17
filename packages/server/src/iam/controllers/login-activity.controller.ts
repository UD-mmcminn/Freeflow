import { Request, Response } from 'express'

export interface ILoginActivityController {
    listLoginActivity(req: Request, res: Response): Promise<Response>
}

export class LoginActivityController implements ILoginActivityController {
    async listLoginActivity(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default LoginActivityController
