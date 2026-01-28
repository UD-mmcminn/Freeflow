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

import SSOBase from './SSOBase'

const name = 'azure'

export default class AzureSSO extends SSOBase {
    static LOGIN_URI = `/api/v1/sso/${name}/login`
    static LOGOUT_URI = `/api/v1/sso/${name}/logout`
    static CALLBACK_URI = `/api/v1/sso/${name}/callback`
}
