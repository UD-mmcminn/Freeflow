import { Request, Response } from 'express'

export const listWorkspaces = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const getWorkspace = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const createWorkspace = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const updateWorkspace = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const deleteWorkspace = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export default {
    listWorkspaces,
    getWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
}
