import express from 'express'
import exportImportController from '../../controllers/export-import'
import { checkWorkspacePermission } from '../../iam/rbac/PermissionCheck'
const router = express.Router()

router.post('/export', checkWorkspacePermission('workspace:export'), exportImportController.exportData)

router.post('/chatflow-messages', checkWorkspacePermission('workspace:export'), exportImportController.exportChatflowMessages)

router.post('/import', checkWorkspacePermission('workspace:import'), exportImportController.importData)

export default router
