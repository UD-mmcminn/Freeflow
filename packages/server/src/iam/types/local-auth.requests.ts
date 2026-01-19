export interface SetPasswordRequestBody {
    userId?: string
    email?: string
    password: string
}

export interface VerifyPasswordRequestBody {
    userId?: string
    email?: string
    password: string
}

export interface ResetPasswordRequestBody {
    token: string
    password: string
}

export interface ChangePasswordRequestBody {
    userId?: string
    email?: string
    currentPassword: string
    newPassword: string
}
