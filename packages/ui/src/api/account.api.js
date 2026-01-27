import client from '@/api/client'

const inviteAccount = (body) => client.post(`/account/invite`, body)
const acceptInvite = (body) => client.post('/account/accept-invite', body)
const resendInvite = (body) => client.post('/account/resend-invite', body)
const forgotPassword = (body) => client.post('/account/forgot-password', body)
const resetPassword = (body) => client.post('/local-auth/reset', body)
const getBillingData = () => client.post('/account/billing')
const getBasicAuth = () => client.get('/account/basic-auth')
const checkBasicAuth = (body) => client.post('/account/basic-auth', body)
const changePassword = (body) => client.post('/local-auth/change', body)

export default {
    getBillingData,
    inviteAccount,
    acceptInvite,
    resendInvite,
    forgotPassword,
    resetPassword,
    getBasicAuth,
    checkBasicAuth,
    changePassword
}
