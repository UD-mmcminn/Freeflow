export class AccountService {
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
