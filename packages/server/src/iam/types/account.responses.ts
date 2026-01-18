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
