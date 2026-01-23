import express from 'express'
import toolsController from '../../controllers/tools'
import { checkAnyWorkspacePermission, checkWorkspacePermission } from '../../iam/rbac/PermissionCheck'

const router = express.Router()

// CREATE
router.post('/', checkWorkspacePermission('tools:create'), toolsController.createTool)

// READ
router.get('/', checkWorkspacePermission('tools:view'), toolsController.getAllTools)
router.get(['/', '/:id'], checkAnyWorkspacePermission('tools:view'), toolsController.getToolById)

// UPDATE
router.put(['/', '/:id'], checkAnyWorkspacePermission('tools:update,tools:create'), toolsController.updateTool)

// DELETE
router.delete(['/', '/:id'], checkWorkspacePermission('tools:delete'), toolsController.deleteTool)

export default router
