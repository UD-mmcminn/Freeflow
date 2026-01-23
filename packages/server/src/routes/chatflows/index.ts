import express from 'express'
import chatflowsController from '../../controllers/chatflows'
import { checkAnyWorkspacePermission } from '../../iam/rbac/PermissionCheck'
const router = express.Router()

// CREATE
router.post(
    '/',
    checkAnyWorkspacePermission('chatflows:create,chatflows:update,agentflows:create,agentflows:update'),
    chatflowsController.saveChatflow
)

// READ
router.get(
    '/',
    checkAnyWorkspacePermission('chatflows:view,chatflows:update,agentflows:view,agentflows:update'),
    chatflowsController.getAllChatflows
)
router.get(
    ['/', '/:id'],
    checkAnyWorkspacePermission('chatflows:view,chatflows:update,chatflows:delete,agentflows:view,agentflows:update,agentflows:delete'),
    chatflowsController.getChatflowById
)
router.get(['/apikey/', '/apikey/:apikey'], chatflowsController.getChatflowByApiKey)

// UPDATE
router.put(
    ['/', '/:id'],
    checkAnyWorkspacePermission('chatflows:create,chatflows:update,agentflows:create,agentflows:update'),
    chatflowsController.updateChatflow
)

// DELETE
router.delete(['/', '/:id'], checkAnyWorkspacePermission('chatflows:delete,agentflows:delete'), chatflowsController.deleteChatflow)

// CHECK FOR CHANGE
router.get(
    '/has-changed/:id/:lastUpdatedDateTime',
    checkAnyWorkspacePermission('chatflows:update,agentflows:update'),
    chatflowsController.checkIfChatflowHasChanged
)

export default router
