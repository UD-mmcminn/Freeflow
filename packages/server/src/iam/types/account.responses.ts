import { IAccountDescriptor } from '../Interface.Iam'

export interface AccountResponse {
    account: IAccountDescriptor
    message?: string
}

export interface AccountNotFoundResponse {
    message: string
}

export interface InviteResentResponse {
    message: string
}

export interface InviteNextStep {
    type: 'local-auth'
    token: string
    expiresAt: number
}

export interface AcceptInviteResponse extends AccountResponse {
    status: 'accepted'
    nextSteps: InviteNextStep[]
}
