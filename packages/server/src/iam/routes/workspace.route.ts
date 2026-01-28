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
import WorkspaceController from '../controllers/workspace.controller'

const router = express.Router()
const controller = new WorkspaceController()

router.get('/shared/:sharedItemId', controller.listWorkspaceShares.bind(controller))
router.post('/shared/:sharedItemId', controller.setWorkspaceShares.bind(controller))
router.post('/switch', controller.switchWorkspace.bind(controller))

router.get('/', controller.listWorkspaces.bind(controller))
router.get('/:workspaceId', controller.getWorkspace.bind(controller))
router.post('/', controller.createWorkspace.bind(controller))
router.put('/', controller.updateWorkspace.bind(controller))
router.delete('/:workspaceId', controller.deleteWorkspace.bind(controller))

export default router
