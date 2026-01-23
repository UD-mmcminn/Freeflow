import express from 'express'
import evaluatorsController from '../../controllers/evaluators'
import { checkWorkspacePermission, checkAnyWorkspacePermission } from '../../iam/rbac/PermissionCheck'
const router = express.Router()

// get all datasets
router.get('/', checkWorkspacePermission('evaluators:view'), evaluatorsController.getAllEvaluators)
// get new dataset
router.get(['/', '/:id'], checkWorkspacePermission('evaluators:view'), evaluatorsController.getEvaluator)
// Create new dataset
router.post(['/', '/:id'], checkWorkspacePermission('evaluators:create'), evaluatorsController.createEvaluator)
// Update dataset
router.put(['/', '/:id'], checkAnyWorkspacePermission('evaluators:create,evaluators:update'), evaluatorsController.updateEvaluator)
// Delete dataset via id
router.delete(['/', '/:id'], checkWorkspacePermission('evaluators:delete'), evaluatorsController.deleteEvaluator)

export default router
