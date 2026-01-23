import express from 'express'
import assistantsController from '../../controllers/assistants'
import { checkWorkspacePermission, checkAnyWorkspacePermission } from '../../iam/rbac/PermissionCheck'

const router = express.Router()

// CREATE
router.post('/', checkWorkspacePermission('assistants:create'), assistantsController.createAssistant)

// READ
router.get('/', checkWorkspacePermission('assistants:view'), assistantsController.getAllAssistants)
router.get(['/', '/:id'], checkWorkspacePermission('assistants:view'), assistantsController.getAssistantById)

// UPDATE
router.put(['/', '/:id'], checkAnyWorkspacePermission('assistants:create,assistants:update'), assistantsController.updateAssistant)

// DELETE
router.delete(['/', '/:id'], checkWorkspacePermission('assistants:delete'), assistantsController.deleteAssistant)

router.get('/components/chatmodels', assistantsController.getChatModels)
router.get('/components/docstores', assistantsController.getDocumentStores)
router.get('/components/tools', assistantsController.getTools)

// Generate Assistant Instruction
router.post('/generate/instruction', assistantsController.generateAssistantInstruction)

export default router
