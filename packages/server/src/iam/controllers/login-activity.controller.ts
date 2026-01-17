import { Request, Response } from 'express'

export const listLoginActivity = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export default {
    listLoginActivity
}
