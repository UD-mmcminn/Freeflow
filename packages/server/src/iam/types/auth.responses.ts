import { FeatureFlags, ILoginSession } from '../Interface.Iam'

export interface AuthAssignedWorkspace {
    id: string
    name: string
    role?: string
    organizationId?: string
}

export interface AuthPayload {
    id: string
    email: string
    name: string
    status: string
    role: string | null
    isSSO: boolean
    activeOrganizationId: string
    activeOrganizationSubscriptionId?: string
    activeOrganizationCustomerId?: string
    activeOrganizationProductId?: string
    activeWorkspaceId: string
    activeWorkspace?: string
    lastLogin: string | null
    isOrganizationAdmin: boolean
    assignedWorkspaces: AuthAssignedWorkspace[]
    permissions: string[]
    features: FeatureFlags
    token: string
}

export interface LoginResponse {
    session: ILoginSession
    accessToken?: string
    refreshToken?: string
    user?: any
}

export interface RefreshTokenResponse {
    session: ILoginSession
    accessToken?: string
    refreshToken?: string
    user?: any
}

export interface LogoutResponse {
    message: string
    redirectTo?: string
}
