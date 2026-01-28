/*
 * Copyright (c) 2026 Union Dynamic, Inc
 *
 * This source code is licensed under the "IAM Module License" (AGPLv3 + AI Clause).
 * You may not use this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the LICENSE file in this directory for the full license text and
 * restrictions regarding Artificial Intelligence training.
 */

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
