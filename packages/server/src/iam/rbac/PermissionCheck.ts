import { NextFunction, Request, Response } from 'express'

/**
 * Placeholder permission checks. Replace with real RBAC once Permissions is backed by IAM data.
 */
export const checkPermission =
    (_permission: string) =>
    (_req: Request, _res: Response, next: NextFunction): void => {
        next()
    }

export const checkAnyPermission =
    (_permissions: string[]) =>
    (_req: Request, _res: Response, next: NextFunction): void => {
        next()
    }
