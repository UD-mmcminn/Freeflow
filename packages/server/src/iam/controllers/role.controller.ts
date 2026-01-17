import { Request, Response } from 'express'

export const listRoles = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const getRole = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const createRole = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const updateRole = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const deleteRole = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export default {
    listRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole
}
