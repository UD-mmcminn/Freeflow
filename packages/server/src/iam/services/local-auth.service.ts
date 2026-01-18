export interface ILocalAuthService {
    setPassword(userId: string, password: string): Promise<void>
    verifyPassword(userId: string, password: string): Promise<boolean>
    resetPassword(token: string, newPassword: string): Promise<void>
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>
}

export class LocalAuthService implements ILocalAuthService {
    async setPassword(_userId: string, _password: string): Promise<void> {
        return
    }

    async verifyPassword(_userId: string, _password: string): Promise<boolean> {
        return false
    }

    async resetPassword(_token: string, _newPassword: string): Promise<void> {
        return
    }

    async changePassword(_userId: string, _currentPassword: string, _newPassword: string): Promise<void> {
        return
    }
}

export default LocalAuthService
