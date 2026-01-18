import express from 'express'
import LoginSessionController from '../controllers/login-session.controller'

const router = express.Router()
const controller = new LoginSessionController()

router.get('/', controller.listLoginSessions.bind(controller))
router.get('/:sessionId', controller.getLoginSession.bind(controller))
router.delete('/:sessionId', controller.revokeLoginSession.bind(controller))

export default router
