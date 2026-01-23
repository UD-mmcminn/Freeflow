import express from 'express'
import executionController from '../../controllers/executions'
import { checkAnyWorkspacePermission } from '../../iam/rbac/PermissionCheck'
const router = express.Router()

// READ
router.get('/', checkAnyWorkspacePermission('executions:view'), executionController.getAllExecutions)
router.get(['/', '/:id'], checkAnyWorkspacePermission('executions:view'), executionController.getExecutionById)

// PUT
router.put(['/', '/:id'], executionController.updateExecution)

// DELETE - single execution or multiple executions
router.delete('/:id', checkAnyWorkspacePermission('executions:delete'), executionController.deleteExecutions)
router.delete('/', checkAnyWorkspacePermission('executions:delete'), executionController.deleteExecutions)

export default router
