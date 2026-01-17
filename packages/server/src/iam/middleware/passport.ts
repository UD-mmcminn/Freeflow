import { Application, NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { LoggedInUser } from '../Interface.Iam'

const buildStubUser = (): LoggedInUser => {
    const orgId = process.env.DEFAULT_ORG_ID || 'stub-org'
    const workspaceId = process.env.DEFAULT_WORKSPACE_ID || 'stub-workspace'
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

export const initializeJwtCookieMiddleware = async (app: Application): Promise<void> => {
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
