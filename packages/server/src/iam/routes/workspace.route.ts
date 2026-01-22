import express from 'express'
import WorkspaceController from '../controllers/workspace.controller'

const router = express.Router()
const controller = new WorkspaceController()

router.get('/shared/:sharedItemId', controller.listWorkspaceShares.bind(controller))
router.post('/shared/:sharedItemId', controller.setWorkspaceShares.bind(controller))
router.post('/switch', controller.switchWorkspace.bind(controller))

router.get('/', controller.listWorkspaces.bind(controller))
router.get('/:workspaceId', controller.getWorkspace.bind(controller))
router.post('/', controller.createWorkspace.bind(controller))
router.put('/', controller.updateWorkspace.bind(controller))
router.delete('/:workspaceId', controller.deleteWorkspace.bind(controller))

export default router
