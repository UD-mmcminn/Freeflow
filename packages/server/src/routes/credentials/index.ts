import express from 'express'
import credentialsController from '../../controllers/credentials'
import { checkWorkspacePermission, checkAnyWorkspacePermission } from '../../iam/rbac/PermissionCheck'
const router = express.Router()

// CREATE
router.post('/', checkWorkspacePermission('credentials:create'), credentialsController.createCredential)

// READ
router.get('/', checkWorkspacePermission('credentials:view'), credentialsController.getAllCredentials)
router.get(['/', '/:id'], checkWorkspacePermission('credentials:view'), credentialsController.getCredentialById)

// UPDATE
router.put(['/', '/:id'], checkAnyWorkspacePermission('credentials:create,credentials:update'), credentialsController.updateCredential)

// DELETE
router.delete(['/', '/:id'], checkWorkspacePermission('credentials:delete'), credentialsController.deleteCredentials)

export default router
