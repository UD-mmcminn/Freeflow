import express from 'express'
import AccountController from '../controllers/account.controller'

const router = express.Router()
const controller = new AccountController()

router.post('/invite', controller.createInvite.bind(controller))
router.post('/register', controller.registerUser.bind(controller))
router.post('/accept-invite', controller.acceptInvite.bind(controller))
router.post('/resend-invite', controller.resendInvite.bind(controller))

export default router
