import { IInvite } from '../Interface.Iam'

export interface INotificationService {
    sendInvite(invite: IInvite): Promise<void>
}

export class NotificationService implements INotificationService {
    async sendInvite(_invite: IInvite): Promise<void> {
        return
    }
}

export default NotificationService
