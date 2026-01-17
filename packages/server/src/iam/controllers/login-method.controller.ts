import { Request, Response } from 'express'

export const getLoginMethods = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const updateLoginMethod = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const createLoginMethod = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const deleteLoginMethod = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export default {
    getLoginMethods,
    updateLoginMethod,
    createLoginMethod,
    deleteLoginMethod
}
