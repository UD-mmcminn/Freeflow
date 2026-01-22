import express from 'express'
import OrganizationUserController from '../controllers/organization-user.controller'

const router = express.Router()
const controller = new OrganizationUserController()

router.get('/', controller.listOrganizationUsers.bind(controller))
router.get('/detail', controller.getOrganizationUser.bind(controller))
router.put('/', controller.updateOrganizationUser.bind(controller))
router.delete('/', controller.deleteOrganizationUser.bind(controller))

export default router
