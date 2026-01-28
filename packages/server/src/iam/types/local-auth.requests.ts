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

export interface SetPasswordRequestBody {
    userId?: string
    email?: string
    password: string
}

export interface VerifyPasswordRequestBody {
    userId?: string
    email?: string
    password: string
}

export interface ResetPasswordRequestBody {
    token: string
    password: string
}

export interface ChangePasswordRequestBody {
    userId?: string
    email?: string
    currentPassword: string
    newPassword: string
}
