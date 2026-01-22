import { ILoginSession } from '../Interface.Iam'

export interface LoginResponse {
    session: ILoginSession
    accessToken?: string
    refreshToken?: string
    user?: any
}

export interface RefreshTokenResponse {
    session: ILoginSession
    accessToken?: string
    refreshToken?: string
    user?: any
}

export interface LogoutResponse {
    message: string
    redirectTo?: string
}
