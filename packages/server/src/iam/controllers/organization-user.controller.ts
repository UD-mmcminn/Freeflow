import { Request, Response } from 'express'

export const listOrganizationUsers = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const getOrganizationUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const createOrganizationUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const updateOrganizationUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const deleteOrganizationUser = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export default {
    listOrganizationUsers,
    getOrganizationUser,
    createOrganizationUser,
    updateOrganizationUser,
    deleteOrganizationUser
}
