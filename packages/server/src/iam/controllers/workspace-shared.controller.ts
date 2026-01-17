import { Request, Response } from 'express'

export const listWorkspaceShared = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const getWorkspaceShared = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const createWorkspaceShared = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const deleteWorkspaceShared = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export default {
    listWorkspaceShared,
    getWorkspaceShared,
    createWorkspaceShared,
    deleteWorkspaceShared
}
