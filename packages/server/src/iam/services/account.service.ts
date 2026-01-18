import { AccountDescriptorInput, IAccountDescriptor } from '../Interface.Iam'

export interface IAccountService {
    createUser(payload: AccountDescriptorInput): Promise<any>
    registerUser(payload: AccountDescriptorInput): Promise<any>
    createInvite(payload: AccountDescriptorInput): Promise<any>
    revokeInvite(inviteId: string): Promise<void>
    acceptInvite(token: string, payload: AccountDescriptorInput): Promise<any>
    resendInvite(email: string): Promise<void>
    sendVerificationEmail(email: string): Promise<void>
    verifyEmail(token: string): Promise<void>
    resendVerificationEmail(email: string): Promise<void>
    getProfile(userId: string): Promise<IAccountDescriptor | null>
    updateProfile(userId: string, payload: AccountDescriptorInput): Promise<IAccountDescriptor | null>
    deactivateAccount(userId: string): Promise<void>
    deleteAccount(userId: string): Promise<void>
}

export class AccountService implements IAccountService {
    async createUser(_payload: AccountDescriptorInput): Promise<any> {
        return null
    }

    async registerUser(_payload: AccountDescriptorInput): Promise<any> {
        return null
    }

    async createInvite(_payload: AccountDescriptorInput): Promise<any> {
        return null
    }

    async revokeInvite(_inviteId: string): Promise<void> {
        return
    }

    async acceptInvite(_token: string, _payload: AccountDescriptorInput): Promise<any> {
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

    async getProfile(_userId: string): Promise<IAccountDescriptor | null> {
        return null
    }

    async updateProfile(_userId: string, _payload: AccountDescriptorInput): Promise<IAccountDescriptor | null> {
        return null
    }

    async deactivateAccount(_userId: string): Promise<void> {
        return
    }

    async deleteAccount(_userId: string): Promise<void> {
        return
    }
}
export default AccountService
