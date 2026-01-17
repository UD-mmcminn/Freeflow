import type { User as ExpressUser } from 'express'

export type FeatureFlags = Record<string, string>

export enum ErrorMessage {
    FORBIDDEN = 'Forbidden'
}

/**
 * Core user shape carried on req.user/passport sessions.
 * Keep fields optional unless code expects them to exist.
 */
export interface LoggedInUser extends ExpressUser {
    id: string
    email?: string
    firstName?: string
    lastName?: string
    permissions: string[]
    roles?: string[]
    isSuperAdmin?: boolean
    isOrganizationAdmin?: boolean
    activeOrganizationId?: string
    activeOrganizationSubscriptionId?: string
    activeOrganizationCustomerId?: string
    activeOrganizationProductId?: string
    activeWorkspaceId?: string
    activeWorkspaceRole?: string
    features?: FeatureFlags
    authStrategy?: string
}

export interface JwtPayload {
    userId: string
    orgId?: string
    workspaceId?: string
    iat?: number
    exp?: number
}
