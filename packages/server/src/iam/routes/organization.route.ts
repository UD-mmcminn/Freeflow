import express from 'express'
import OrganizationController from '../controllers/organization.controller'

const router = express.Router()
const controller = new OrganizationController()

router.get('/', controller.listOrganizations.bind(controller))
router.get('/:organizationId', controller.getOrganization.bind(controller))
router.post('/', controller.createOrganization.bind(controller))
router.put('/', controller.updateOrganization.bind(controller))
router.delete('/', controller.deleteOrganization.bind(controller))

export default router
