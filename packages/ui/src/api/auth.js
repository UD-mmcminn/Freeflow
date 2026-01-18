import client from './client'

// auth
const resolveLogin = (body) => client.post(`/auth/resolve`, body)
const login = (body) => client.post(`/auth/login`, body)
const logout = (body) => client.post('/auth/logout', body)
const refreshToken = (body) => client.post('/auth/refreshToken', body)

// permissions
const getAllPermissions = (type) => client.get(`/auth/permissions/${type}`)
const ssoSuccess = (token) => client.get(`/auth/sso-success?token=${token}`)

export default {
    resolveLogin,
    login,
    logout,
    refreshToken,
    getAllPermissions,
    ssoSuccess
}
