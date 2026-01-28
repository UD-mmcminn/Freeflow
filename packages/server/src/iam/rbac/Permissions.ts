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

export type PermissionDefinition = {
    key: string
    value: string
    isOpenSource: boolean
    isIam: boolean
    isCloud: boolean
}

export const PERMISSION_KEYS = [
    'agentflows:create',
    'agentflows:delete',
    'agentflows:update',
    'agentflows:view',
    'apikeys:create',
    'apikeys:delete',
    'apikeys:update',
    'apikeys:view',
    'assistants:create',
    'assistants:delete',
    'assistants:update',
    'assistants:view',
    'chatflows:create',
    'chatflows:delete',
    'chatflows:update',
    'chatflows:view',
    'credentials:create',
    'credentials:delete',
    'credentials:share',
    'credentials:update',
    'credentials:view',
    'datasets:create',
    'datasets:delete',
    'datasets:update',
    'datasets:view',
    'documentStores:add-loader',
    'documentStores:create',
    'documentStores:delete',
    'documentStores:delete-loader',
    'documentStores:preview-process',
    'documentStores:update',
    'documentStores:upsert-config',
    'documentStores:view',
    'evaluations:create',
    'evaluations:delete',
    'evaluations:run',
    'evaluations:view',
    'evaluators:create',
    'evaluators:delete',
    'evaluators:update',
    'evaluators:view',
    'executions:delete',
    'executions:view',
    'loginActivity:delete',
    'loginActivity:view',
    'logs:view',
    'roles:manage',
    'sso:manage',
    'templates:custom',
    'templates:custom-delete',
    'templates:custom-share',
    'templates:flowexport',
    'templates:marketplace',
    'templates:toolexport',
    'tools:create',
    'tools:delete',
    'tools:export',
    'tools:update',
    'tools:view',
    'users:manage',
    'variables:create',
    'variables:delete',
    'variables:update',
    'variables:view',
    'workspace:add-user',
    'workspace:create',
    'workspace:delete',
    'workspace:export',
    'workspace:import',
    'workspace:unlink-user',
    'workspace:update',
    'workspace:view'
]

const formatPermissionValue = (key: string): string => {
    const action = key.split(':')[1] ?? key
    return action
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join(' ')
}

const buildPermissionMap = (): Record<string, PermissionDefinition[]> => {
    const grouped: Record<string, PermissionDefinition[]> = {}
    for (const key of PERMISSION_KEYS) {
        const [category] = key.split(':')
        const entry: PermissionDefinition = {
            key,
            value: formatPermissionValue(key),
            isOpenSource: true,
            isIam: true,
            isCloud: true
        }
        grouped[category] = grouped[category] ?? []
        grouped[category].push(entry)
    }
    Object.keys(grouped).forEach((category) => {
        grouped[category] = grouped[category].sort((a, b) => a.value.localeCompare(b.value))
    })
    return grouped
}

export class Permissions {
    getAllPermissions() {
        return buildPermissionMap()
    }

    hasPermission(): boolean {
        return true
    }
}

export default Permissions
