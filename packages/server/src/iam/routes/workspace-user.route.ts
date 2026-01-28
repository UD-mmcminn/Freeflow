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
import WorkspaceUserController from '../controllers/workspace-user.controller'

const router = express.Router()
const controller = new WorkspaceUserController()

router.get('/', controller.listWorkspaceUsers.bind(controller))
router.get('/:workspaceUserId', controller.getWorkspaceUser.bind(controller))
router.post('/', controller.createWorkspaceUser.bind(controller))
router.put('/', controller.updateWorkspaceUser.bind(controller))
router.delete('/', controller.deleteWorkspaceUser.bind(controller))

export default router
