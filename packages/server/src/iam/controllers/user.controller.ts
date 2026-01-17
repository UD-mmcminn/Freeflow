import { Request, Response } from 'express'

export const listUsers = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const getUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const createUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const updateUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const deleteUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export default {
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
}
