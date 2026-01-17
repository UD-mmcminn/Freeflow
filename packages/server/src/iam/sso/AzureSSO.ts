import SSOBase from './SSOBase'

const name = 'azure'

export default class AzureSSO extends SSOBase {
    static LOGIN_URI = `/api/v1/sso/${name}/login`
    static LOGOUT_URI = `/api/v1/sso/${name}/logout`
    static CALLBACK_URI = `/api/v1/sso/${name}/callback`
}
