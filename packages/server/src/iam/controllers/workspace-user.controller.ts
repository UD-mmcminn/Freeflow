import { Request, Response } from 'express'

export const listWorkspaceUsers = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const getWorkspaceUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const createWorkspaceUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const updateWorkspaceUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const deleteWorkspaceUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export default {
    listWorkspaceUsers,
    getWorkspaceUser,
    createWorkspaceUser,
    updateWorkspaceUser,
    deleteWorkspaceUser
}
