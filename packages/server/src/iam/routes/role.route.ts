import express from 'express'
import RoleController from '../controllers/role.controller'
import { checkOrganizationPermission } from '../rbac/PermissionCheck'

const router = express.Router()
const controller = new RoleController()
const resolveOrganizationId = (req: express.Request): string | undefined =>
    (req.query?.organizationId as string | undefined) ??
    (req.body?.organizationId as string | undefined) ??
    (req.query?.id as string | undefined)

router.get('/', checkOrganizationPermission('roles:manage', resolveOrganizationId), controller.listRoles.bind(controller))
router.get('/name/:name', checkOrganizationPermission('roles:manage', resolveOrganizationId), controller.getRoleByName.bind(controller))
router.get('/:roleId', checkOrganizationPermission('roles:manage', resolveOrganizationId), controller.getRole.bind(controller))
router.post('/', checkOrganizationPermission('roles:manage', resolveOrganizationId), controller.createRole.bind(controller))
router.put('/', checkOrganizationPermission('roles:manage', resolveOrganizationId), controller.updateRole.bind(controller))
router.delete('/', checkOrganizationPermission('roles:manage', resolveOrganizationId), controller.deleteRole.bind(controller))
router.delete('/:roleId', checkOrganizationPermission('roles:manage', resolveOrganizationId), controller.deleteRole.bind(controller))

export default router
