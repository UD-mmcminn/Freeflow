import express from 'express'
import OrganizationUserController from '../controllers/organization-user.controller'

const router = express.Router()
const controller = new OrganizationUserController()

router.get('/', controller.listOrganizationUsers.bind(controller))

export default router
