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

export interface OrganizationSetupRequestBody {
    organization: { name: string; subscriptionId?: string; customerId?: string; productId?: string }
    user?: { email?: string; name?: string; firstName?: string; lastName?: string }
    workspace?: { id?: string; name?: string; isPersonal?: boolean }
    role?: { id?: string; name?: string; permissions?: string[] }
}
