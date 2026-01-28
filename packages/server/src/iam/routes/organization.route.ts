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
import OrganizationController from '../controllers/organization.controller'
import OrganizationSetupController from '../controllers/organization-setup.controller'

const router = express.Router()
const controller = new OrganizationController()
const setupController = new OrganizationSetupController()

router.get('/', controller.listOrganizations.bind(controller))
router.get('/:organizationId', controller.getOrganization.bind(controller))
router.post('/setup', setupController.setupOrganization.bind(setupController))
router.post('/', controller.createOrganization.bind(controller))
router.put('/', controller.updateOrganization.bind(controller))
router.delete('/', controller.deleteOrganization.bind(controller))

export default router
