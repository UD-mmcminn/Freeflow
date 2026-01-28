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
import AccountController from '../controllers/account.controller'

const router = express.Router()
const controller = new AccountController()

router.post('/invite', controller.createInvite.bind(controller))
router.get('/accept-invite', controller.acceptInvite.bind(controller))
router.post('/accept-invite', controller.acceptInvite.bind(controller))
router.post('/resend-invite', controller.resendInvite.bind(controller))
router.post('/forgot-password', controller.forgotPassword.bind(controller))
router.post('/reset-password', controller.resetPassword.bind(controller))

export default router
