export interface LoginRequestBody {
    userId?: string
    email?: string
    password?: string
}

export interface LogoutRequestBody {
    sessionToken: string
}

export interface RefreshTokenRequestBody {
    refreshToken: string
}
