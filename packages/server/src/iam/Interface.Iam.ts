export type FeatureFlags = Record<string, string>

export type LoginMethodStatusLike = 'ENABLE' | 'DISABLE'
export type RoleScope = 'system' | 'organization' | 'workspace'
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'DISABLED'

export enum ErrorMessage {
    FORBIDDEN = 'Forbidden'
}

/**
 * Core user shape carried on req.user/passport sessions.
 * Keep fields optional unless code expects them to exist.
 */
export interface LoggedInUser {
    id: string
    email?: string
    firstName?: string
    lastName?: string
    permissions: string[]
    roles?: string[]
    isSuperAdmin?: boolean
    isOrganizationAdmin?: boolean
    activeOrganizationId: string
    activeOrganizationSubscriptionId?: string
    activeOrganizationCustomerId?: string
    activeOrganizationProductId?: string
    activeWorkspaceId: string
    activeWorkspace?: string
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

export interface IUser {
    id: string
    email: string
    firstName?: string
    lastName?: string
    credential?: string | Promise<string>
    tempToken?: string
    tokenExpiry?: number
    status: AccountStatus
    createdDate: Date
    updatedDate: Date
    organizationUsers?: IOrganizationUser[]
    workspaceUsers?: IWorkspaceUser[]
    loginSessions?: ILoginSession[]
    loginActivities?: ILoginActivity[]
    credentials?: IUserCredential[]
}

export interface IOrganization {
    id: string
    name: string
    subscriptionId?: string
    customerId?: string
    productId?: string
    createdDate: Date
    updatedDate: Date
    workspaces?: IWorkspace[]
    organizationUsers?: IOrganizationUser[]
    roles?: IRole[]
    loginMethods?: ILoginMethod[]
}

export interface IWorkspace {
    id: string
    name: string
    organizationId: string
    isPersonal: boolean
    createdDate: Date
    updatedDate: Date
    organization?: IOrganization
    workspaceUsers?: IWorkspaceUser[]
    sharedItems?: IWorkspaceShared[]
}

export interface IOrganizationUser {
    id: string
    organizationId: string
    userId: string
    roleId?: string
    isOwner: boolean
    status: AccountStatus
    createdDate: Date
    updatedDate: Date
    organization?: IOrganization
    user?: IUser
    role?: IRole
}

export interface IWorkspaceUser {
    id: string
    workspaceId: string
    userId: string
    roleId?: string
    status: AccountStatus
    createdDate: Date
    updatedDate: Date
    workspace?: IWorkspace
    user?: IUser
    role?: IRole
}

export interface IRole {
    id: string
    name: string
    permissions: any
    scope: RoleScope
    organizationId?: string
    createdDate: Date
    updatedDate: Date
    organization?: IOrganization
    organizationUsers?: IOrganizationUser[]
    workspaceUsers?: IWorkspaceUser[]
}

export interface ILoginMethod {
    id: string
    name: string
    status: LoginMethodStatusLike
    config: string
    organizationId?: string
    createdDate: Date
    updatedDate: Date
    organization?: IOrganization
}

export interface ILoginSession {
    id: string
    userId: string
    sessionToken: string
    refreshToken?: string
    expiresAt?: Date
    createdDate: Date
    updatedDate: Date
    user?: IUser
}

export interface ILoginActivity {
    id: string
    userId: string
    organizationId?: string
    workspaceId?: string
    authStrategy?: string
    status?: string
    ipAddress?: string
    userAgent?: string
    createdDate: Date
    user?: IUser
    organization?: IOrganization
    workspace?: IWorkspace
}

export interface IWorkspaceShared {
    id: string
    workspaceId: string
    sharedItemId: string
    itemType: string
    createdByUserId?: string
    createdDate: Date
    workspace?: IWorkspace
    createdBy?: IUser
}

export interface IUserCredential {
    id: string
    userId: string
    provider: string
    passwordHash?: string
    tempToken?: string
    tokenExpiry?: number
    createdDate: Date
    updatedDate: Date
    user?: IUser
}

export interface IAccountDescriptor {
    user?: IUser
    organization?: IOrganization
    organizationUsers?: IOrganizationUser[]
    workspaces?: IWorkspace[]
    workspaceUsers?: IWorkspaceUser[]
    roles?: IRole[]
    loginMethods?: ILoginMethod[]
    loginSessions?: ILoginSession[]
    loginActivities?: ILoginActivity[]
    credentials?: IUserCredential[]
    invites?: IInvite[]
}

export interface IAccountDescriptorInput {
    user?: Partial<IUser>
    organization?: Partial<IOrganization>
    organizationUsers?: Array<Partial<IOrganizationUser>>
    workspaces?: Array<Partial<IWorkspace>>
    workspaceUsers?: Array<Partial<IWorkspaceUser>>
    roles?: Array<Partial<IRole>>
    loginMethods?: Array<Partial<ILoginMethod>>
    loginSessions?: Array<Partial<ILoginSession>>
    loginActivities?: Array<Partial<ILoginActivity>>
    credentials?: Array<Partial<IUserCredential>>
    invites?: Array<Partial<IInvite>>
}

export type AccountDescriptorInput = IAccountDescriptorInput

export interface IInvite {
    id: string
    email: string
    organizationId?: string
    workspaceId?: string
    roleId?: string
    token?: string
    expiresAt?: Date
    acceptedAt?: Date
    createdDate?: Date
}
