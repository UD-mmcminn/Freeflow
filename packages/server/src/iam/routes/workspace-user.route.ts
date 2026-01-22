import express from 'express'
import WorkspaceUserController from '../controllers/workspace-user.controller'

const router = express.Router()
const controller = new WorkspaceUserController()

router.get('/', controller.listWorkspaceUsers.bind(controller))
router.get('/:workspaceUserId', controller.getWorkspaceUser.bind(controller))
router.post('/', controller.createWorkspaceUser.bind(controller))
router.put('/', controller.updateWorkspaceUser.bind(controller))
router.delete('/', controller.deleteWorkspaceUser.bind(controller))

export default router
