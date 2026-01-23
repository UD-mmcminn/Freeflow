import express from 'express'
import evaluationsController from '../../controllers/evaluations'
import { checkWorkspacePermission, checkAnyWorkspacePermission } from '../../iam/rbac/PermissionCheck'
const router = express.Router()

router.get('/', checkWorkspacePermission('evaluations:view'), evaluationsController.getAllEvaluations)
router.get('/:id', checkWorkspacePermission('evaluations:view'), evaluationsController.getEvaluation)
router.delete('/:id', checkWorkspacePermission('evaluations:delete'), evaluationsController.deleteEvaluation)
router.post('/', checkWorkspacePermission('evaluations:create'), evaluationsController.createEvaluation)
router.get('/is-outdated/:id', evaluationsController.isOutdated)
router.post('/run-again/:id', checkAnyWorkspacePermission('evaluations:create,evaluations:run'), evaluationsController.runAgain)
router.get('/versions/:id', checkWorkspacePermission('evaluations:view'), evaluationsController.getVersions)
router.patch('/', checkWorkspacePermission('evaluations:delete'), evaluationsController.patchDeleteEvaluations)
export default router
