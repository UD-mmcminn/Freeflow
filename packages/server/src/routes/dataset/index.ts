import express from 'express'
import datasetController from '../../controllers/dataset'
import { checkAnyWorkspacePermission, checkWorkspacePermission } from '../../iam/rbac/PermissionCheck'
const router = express.Router()

// get all datasets
router.get('/', checkWorkspacePermission('datasets:view'), datasetController.getAllDatasets)
// get new dataset
router.get(['/set', '/set/:id'], checkWorkspacePermission('datasets:view'), datasetController.getDataset)
// Create new dataset
router.post(['/set', '/set/:id'], checkWorkspacePermission('datasets:create'), datasetController.createDataset)
// Update dataset
router.put(['/set', '/set/:id'], checkAnyWorkspacePermission('datasets:create,datasets:update'), datasetController.updateDataset)
// Delete dataset via id
router.delete(['/set', '/set/:id'], checkWorkspacePermission('datasets:delete'), datasetController.deleteDataset)

// Create new row in a given dataset
router.post(['/rows', '/rows/:id'], checkWorkspacePermission('datasets:create'), datasetController.addDatasetRow)
// Update row for a dataset
router.put(['/rows', '/rows/:id'], checkAnyWorkspacePermission('datasets:create,datasets:update'), datasetController.updateDatasetRow)
// Delete dataset row via id
router.delete(['/rows', '/rows/:id'], checkWorkspacePermission('datasets:delete'), datasetController.deleteDatasetRow)
// PATCH delete by ids
router.patch('/rows', checkWorkspacePermission('datasets:delete'), datasetController.patchDeleteRows)

// Update row for a dataset
router.post(['/reorder', '/reorder'], checkAnyWorkspacePermission('datasets:create,datasets:update'), datasetController.reorderDatasetRow)

export default router
