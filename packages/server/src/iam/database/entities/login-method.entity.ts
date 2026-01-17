export enum LoginMethodStatus {
    ENABLE = 'ENABLE',
    DISABLE = 'DISABLE'
}
export class LoginMethod {
    [key: string]: any
    id?: string
    status?: LoginMethodStatus
    config: string = '{}'
    name: string = ''
    organizationId?: string
}
