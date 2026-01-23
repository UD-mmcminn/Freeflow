import express from 'express'
import apikeyController from '../../controllers/apikey'
import { checkAnyWorkspacePermission, checkWorkspacePermission } from '../../iam/rbac/PermissionCheck'
const router = express.Router()

// CREATE
router.post('/', checkWorkspacePermission('apikeys:create'), apikeyController.createApiKey)

// READ
router.get('/', checkWorkspacePermission('apikeys:view'), apikeyController.getAllApiKeys)

// UPDATE
router.put(['/', '/:id'], checkAnyWorkspacePermission('apikeys:create,apikeys:update'), apikeyController.updateApiKey)

// DELETE
router.delete(['/', '/:id'], checkWorkspacePermission('apikeys:delete'), apikeyController.deleteApiKey)

export default router
