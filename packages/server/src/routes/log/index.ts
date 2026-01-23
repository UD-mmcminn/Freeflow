import express from 'express'
import logController from '../../controllers/log'
import { checkAnyWorkspacePermission } from '../../iam/rbac/PermissionCheck'
const router = express.Router()

// READ
router.get('/', checkAnyWorkspacePermission('logs:view'), logController.getLogs)

export default router
