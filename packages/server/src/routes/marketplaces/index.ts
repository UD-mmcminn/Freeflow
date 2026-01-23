import express from 'express'
import marketplacesController from '../../controllers/marketplaces'
import { checkWorkspacePermission, checkAnyWorkspacePermission } from '../../iam/rbac/PermissionCheck'
const router = express.Router()

// READ
router.get('/templates', checkWorkspacePermission('templates:marketplace'), marketplacesController.getAllTemplates)

router.post('/custom', checkAnyWorkspacePermission('templates:flowexport,templates:toolexport'), marketplacesController.saveCustomTemplate)

// READ
router.get('/custom', checkWorkspacePermission('templates:custom'), marketplacesController.getAllCustomTemplates)

// DELETE
router.delete(['/', '/custom/:id'], checkWorkspacePermission('templates:custom-delete'), marketplacesController.deleteCustomTemplate)

export default router
