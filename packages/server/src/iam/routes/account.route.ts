import express from 'express'
import AccountController from '../controllers/account.controller'

const router = express.Router()
const controller = new AccountController()

router.post('/invite', controller.createInvite.bind(controller))
router.get('/accept-invite', controller.acceptInvite.bind(controller))
router.post('/accept-invite', controller.acceptInvite.bind(controller))
router.post('/resend-invite', controller.resendInvite.bind(controller))
router.post('/forgot-password', controller.forgotPassword.bind(controller))
router.post('/reset-password', controller.resetPassword.bind(controller))

export default router
