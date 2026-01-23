import express from 'express'
import AuthController from '../controllers/auth.controller'
import RoleController from '../controllers/role.controller'
import { checkOrganizationPermission } from '../rbac/PermissionCheck'

const router = express.Router()
const controller = new AuthController()
const roleController = new RoleController()
const resolveOrganizationId = (req: express.Request): string | undefined =>
    (req.query?.organizationId as string | undefined) ?? (req.query?.id as string | undefined)

router.post('/resolve', controller.resolveLogin.bind(controller))
router.post('/login', controller.login.bind(controller))
router.post('/logout', controller.logout.bind(controller))
router.post('/refreshToken', controller.refreshToken.bind(controller))
router.get('/permissions/:type', controller.getPermissions.bind(controller))
router.get('/roles/:roleId', checkOrganizationPermission('roles:manage', resolveOrganizationId), roleController.getRole.bind(roleController))
router.get(
    '/roles/name/:name',
    checkOrganizationPermission('roles:manage', resolveOrganizationId),
    roleController.getRoleByName.bind(roleController)
)

export default router
