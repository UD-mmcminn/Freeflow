import express from 'express'
import variablesController from '../../controllers/variables'
import { checkAnyWorkspacePermission, checkWorkspacePermission } from '../../iam/rbac/PermissionCheck'

const router = express.Router()

// CREATE
router.post('/', checkWorkspacePermission('variables:create'), variablesController.createVariable)

// READ
router.get('/', checkWorkspacePermission('variables:view'), variablesController.getAllVariables)

// UPDATE
router.put(['/', '/:id'], checkAnyWorkspacePermission('variables:create,variables:update'), variablesController.updateVariable)

// DELETE
router.delete(['/', '/:id'], checkWorkspacePermission('variables:delete'), variablesController.deleteVariable)

export default router
