import { Request, Response } from 'express'

export interface IUserController {
    listUsers(req: Request, res: Response): Promise<Response>
    getUser(req: Request, res: Response): Promise<Response>
    createUser(req: Request, res: Response): Promise<Response>
    updateUser(req: Request, res: Response): Promise<Response>
    deleteUser(req: Request, res: Response): Promise<Response>
}

export class UserController implements IUserController {
    async listUsers(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async getUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async createUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async deleteUser(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default UserController
