import { Request, Response } from 'express'

export const getAccount = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const updateAccount = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const resetPassword = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export default {
    getAccount,
    updateAccount,
    resetPassword
}
