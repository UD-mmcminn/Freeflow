export interface LoginRequestBody {
    userId?: string
    email?: string
}

export interface LogoutRequestBody {
    sessionToken: string
}

export interface RefreshTokenRequestBody {
    refreshToken: string
}
