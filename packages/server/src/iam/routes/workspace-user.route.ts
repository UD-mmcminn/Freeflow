import express from 'express'
import WorkspaceUserController from '../controllers/workspace-user.controller'

const router = express.Router()
const controller = new WorkspaceUserController()

router.get('/', controller.listWorkspaceUsers.bind(controller))

export default router
