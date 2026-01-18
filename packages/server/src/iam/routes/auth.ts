import express from 'express'
import AuthController from '../controllers/auth.controller'

const router = express.Router()
const controller = new AuthController()

router.post('/resolve', controller.resolveLogin.bind(controller))
router.post('/login', controller.login.bind(controller))
router.post('/logout', controller.logout.bind(controller))
router.post('/refreshToken', controller.refreshToken.bind(controller))

export default router
