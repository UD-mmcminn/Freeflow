import { ILoginSession } from '../Interface.Iam'

export interface LoginResponse {
    session: ILoginSession
}

export interface RefreshTokenResponse {
    session: ILoginSession
}

export interface LogoutResponse {
    message: string
}
