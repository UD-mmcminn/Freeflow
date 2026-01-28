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

import { IInvite } from '../Interface.Iam'
import logger from '../../utils/logger'

export interface INotificationService {
    sendInvite(invite: IInvite): Promise<void>
}

export class NotificationService implements INotificationService {
    async sendInvite(invite: IInvite): Promise<void> {
        const baseUrl =
            process.env.APP_URL || process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`
        const inviteUrl = `${baseUrl}/accept-invite?token=${encodeURIComponent(invite.token ?? '')}`
        // Temporary: log invite URL for local testing without email.
        logger.info(`[iam] Invite URL for ${invite.email}: ${inviteUrl}`)
    }
}

export default NotificationService
