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

import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { LoggedInUser, RoleScope } from '../Interface.Iam'
import RoleService from '../services/role.service'

export interface IRoleController {
    listRoles(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    getRole(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    getRoleByName(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    createRole(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    updateRole(req: Request, res: Response, next: NextFunction): Promise<Response | void>
    deleteRole(req: Request, res: Response, next: NextFunction): Promise<Response | void>
}

export class RoleController implements IRoleController {
    private roleService: RoleService

    constructor(roleService: RoleService = new RoleService()) {
        this.roleService = roleService
    }

    async listRoles(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = this.requireUser(req)
            const organizationId = req.query?.organizationId as string | undefined
            const scope = req.query?.scope as RoleScope | undefined
            const roles = await this.roleService.listRoles(organizationId, scope, user)
            return res.status(StatusCodes.OK).json(roles)
        } catch (error) {
            next(error)
        }
    }

    async getRole(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = this.requireUser(req)
            const roleId = (req.params?.roleId as string | undefined) ?? (req.query?.id as string | undefined)
            if (!roleId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Role id is required')
            }
            const role = await this.roleService.getRoleById(roleId, user)
            if (!role) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Role not found')
            }
            return res.status(StatusCodes.OK).json(role)
        } catch (error) {
            next(error)
        }
    }

    async getRoleByName(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = this.requireUser(req)
            const name = req.params?.name as string | undefined
            if (!name) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Role name is required')
            }
            const organizationId = req.query?.organizationId as string | undefined
            const role = await this.roleService.getRoleByName(name, organizationId, user)
            if (!role) {
                throw new InternalFlowiseError(StatusCodes.NOT_FOUND, 'Role not found')
            }
            return res.status(StatusCodes.OK).json(role)
        } catch (error) {
            next(error)
        }
    }

    async createRole(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = this.requireUser(req)
            const role = await this.roleService.createRole(req.body ?? {}, user)
            return res.status(StatusCodes.OK).json(role)
        } catch (error) {
            next(error)
        }
    }

    async updateRole(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = this.requireUser(req)
            const roleId = (req.body?.id as string | undefined) ?? (req.query?.id as string | undefined)
            if (!roleId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Role id is required')
            }
            const role = await this.roleService.updateRole(roleId, req.body ?? {}, user)
            return res.status(StatusCodes.OK).json(role)
        } catch (error) {
            next(error)
        }
    }

    async deleteRole(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const user = this.requireUser(req)
            const roleId = (req.params?.roleId as string | undefined) ?? (req.query?.id as string | undefined)
            if (!roleId) {
                throw new InternalFlowiseError(StatusCodes.BAD_REQUEST, 'Role id is required')
            }
            await this.roleService.deleteRole(roleId, user)
            return res.status(StatusCodes.OK).json({ message: 'Role deleted' })
        } catch (error) {
            next(error)
        }
    }

    private requireUser(req: Request): LoggedInUser {
        const user = req.user as LoggedInUser | undefined
        if (!user) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
        }
        return user
    }
}

export default RoleController
