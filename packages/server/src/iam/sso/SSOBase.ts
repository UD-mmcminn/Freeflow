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

export default class SSOBase {
    protected config: any
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_app: any, config?: any) {
        this.config = config
    }
    initialize() {}
    setSSOConfig(config: any) {
        this.config = config
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async refreshToken(_token: string) {
        return null
    }
}
