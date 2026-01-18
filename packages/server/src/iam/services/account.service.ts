export interface IAccountService {
    registerUser(payload: any): Promise<any>
    acceptInvite(token: string, payload: any): Promise<any>
    resendInvite(email: string): Promise<void>
    sendVerificationEmail(email: string): Promise<void>
    verifyEmail(token: string): Promise<void>
    resendVerificationEmail(email: string): Promise<void>
    getProfile(userId: string): Promise<any>
    updateProfile(userId: string, payload: any): Promise<any>
}

export class AccountService implements IAccountService {
    async registerUser(_payload: any): Promise<any> {
        return null
    }

    async acceptInvite(_token: string, _payload: any): Promise<any> {
        return null
    }

    async resendInvite(_email: string): Promise<void> {
        return
    }

    async sendVerificationEmail(_email: string): Promise<void> {
        return
    }

    async verifyEmail(_token: string): Promise<void> {
        return
    }

    async resendVerificationEmail(_email: string): Promise<void> {
        return
    }

    async getProfile(_userId: string): Promise<any> {
        return null
    }

    async updateProfile(_userId: string, _payload: any): Promise<any> {
        return null
    }
}
export default AccountService
