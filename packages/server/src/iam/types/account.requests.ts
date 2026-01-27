import { AccountStatus } from '../Interface.Iam'

export interface CreateInviteRequestBody {
    user: { email: string }
    organization?: { id: string }
    workspace?: { id: string }
    role?: { id: string }
    expiresAt?: Date
}

export interface ResendInviteRequestBody {
    user: { email: string }
    organization?: { id: string }
}

export interface AcceptInviteRequestBody {
    token: string
}

export interface GetProfileRequestBody {
    user: { id?: string; email?: string }
}

export interface UpdateProfileRequestBody {
    user: { id: string; firstName?: string; lastName?: string; status?: AccountStatus }
}

export interface ResetPasswordRequestBody {
    user: { email?: string; tempToken: string; password: string }
}

export interface ForgotPasswordRequestBody {
    user: { email: string }
}
