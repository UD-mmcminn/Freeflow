import { Request, Response } from 'express'

export const listLoginSessions = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const getLoginSession = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export const revokeLoginSession = async (_req: Request, res: Response) => {
    return res.status(501).json({ message: 'Not implemented' })
}

export default {
    listLoginSessions,
    getLoginSession,
    revokeLoginSession
}
