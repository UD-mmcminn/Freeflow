/*
 * Copyright (c) 2026 Union Dynamic, Inc
 *
 * This source code is licensed under the "IAM Module License" (AGPLv3 + AI Clause).
 * You may not use this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the LICENSE file in this directory for the full license text and
 * restrictions regarding Artificial Intelligence training.
 */

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
