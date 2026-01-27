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
