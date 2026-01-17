import { Application, NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { LoggedInUser } from '../Interface.Iam'

const requireEnv = (key: string): string => {
    const value = process.env[key]
    if (!value) {
        throw new Error(`Missing required env: ${key}`)
    }
    return value
}

const buildStubUser = (): LoggedInUser => {
    const orgId = requireEnv('DEFAULT_ORG_ID')
    const workspaceId = requireEnv('DEFAULT_WORKSPACE_ID')
    return {
        id: uuidv4(),
        email: 'stub@flowise.local',
        permissions: [],
        roles: [],
        isSuperAdmin: true,
        isOrganizationAdmin: true,
        activeOrganizationId: orgId,
        activeOrganizationSubscriptionId: process.env.DEFAULT_SUBSCRIPTION_ID,
        activeOrganizationCustomerId: process.env.DEFAULT_CUSTOMER_ID,
        activeOrganizationProductId: process.env.DEFAULT_PRODUCT_ID,
        activeWorkspaceId: workspaceId,
        activeWorkspaceRole: 'admin',
        features: {},
        authStrategy: 'stub'
    }
}

export const initializeJwtCookieMiddleware = async (app: Application, _identityManager?: unknown): Promise<void> => {
    app.use((req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            req.user = buildStubUser()
        }
        next()
    })
}

export const verifyToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        req.user = buildStubUser()
    }
    next()
}

export const verifyTokenForBullMQDashboard = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        req.user = buildStubUser()
    }
    next()
}
