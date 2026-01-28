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

import { AccountStatus } from '../Interface.Iam'

export interface CreateInviteRequestBody {
    user: { email: string }
    organization?: { id: string }
    workspace?: { id: string }
    role?: { id: string }
    expiresAt?: Date
}

export interface ResendInviteRequestBody {
    user: { email: string }
    organization?: { id: string }
}

export interface AcceptInviteRequestBody {
    token: string
}

export interface GetProfileRequestBody {
    user: { id?: string; email?: string }
}

export interface UpdateProfileRequestBody {
    user: { id: string; firstName?: string; lastName?: string; status?: AccountStatus }
}

export interface ResetPasswordRequestBody {
    user: { email?: string; tempToken: string; password: string }
}

export interface ForgotPasswordRequestBody {
    user: { email: string }
}
