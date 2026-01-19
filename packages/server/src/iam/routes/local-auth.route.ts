import express from 'express'
import LocalAuthController from '../controllers/local-auth.controller'

const router = express.Router()
const controller = new LocalAuthController()

router.post('/set-password', controller.setPassword.bind(controller))
router.post('/verify', controller.verifyPassword.bind(controller))
router.post('/reset', controller.resetPassword.bind(controller))
router.post('/change', controller.changePassword.bind(controller))

export default router
