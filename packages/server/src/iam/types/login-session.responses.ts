import { ILoginSession } from '../Interface.Iam'

export interface LoginSessionListResponse {
    sessions: ILoginSession[]
}

export interface LoginSessionResponse {
    session: ILoginSession
}

export interface LoginSessionNotFoundResponse {
    message: string
}

export interface LoginSessionDeletedResponse {
    message: string
}
