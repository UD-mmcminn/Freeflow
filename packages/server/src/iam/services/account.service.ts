export interface IAccountService {
    getProfile(userId: string): Promise<any>
    updateProfile(userId: string, payload: any): Promise<any>
    resetPassword(userId: string, newPassword: string): Promise<void>
}

export class AccountService implements IAccountService {
    async getProfile(_userId: string): Promise<any> {
        return null
    }

    async updateProfile(_userId: string, _payload: any): Promise<any> {
        return null
    }

    async resetPassword(_userId: string, _newPassword: string): Promise<void> {
        return
    }
}
export default AccountService
