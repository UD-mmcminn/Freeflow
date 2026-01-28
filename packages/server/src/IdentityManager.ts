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

import express, { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { LoginMethodStatus } from './iam/database/entities/login-method.entity'
import { ErrorMessage } from './iam/Interface.Iam'
import { Permissions } from './iam/rbac/Permissions'
import { LoginMethodService } from './iam/services/login-method.service'
import { OrganizationService } from './iam/services/organization.service'
import Auth0SSO from './iam/sso/Auth0SSO'
import AzureSSO from './iam/sso/AzureSSO'
import GithubSSO from './iam/sso/GithubSSO'
import GoogleSSO from './iam/sso/GoogleSSO'
import SSOBase from './iam/sso/SSOBase'
import { Platform } from './Interface'
import { StripeManager } from './StripeManager'
import { IAM_FEATURE_FLAGS } from './utils/quotaUsage'
import { getRunningExpressApp } from './utils/getRunningExpressApp'
import BillingManager from './iam/billing/BillingManager'

const ALL_SSO_PROVIDERS = ['azure', 'google', 'auth0', 'github']

type FeatureFlags = Record<string, string>

export class IdentityManager {
    private static instance: IdentityManager
    private stripeManager?: StripeManager
    private billingManager?: BillingManager
    permissions: Permissions
    ssoProviderName: string = ''
    currentInstancePlatform: Platform = Platform.IAM
    ssoProviders: Map<string, SSOBase> = new Map()

    public static async getInstance(): Promise<IdentityManager> {
        if (!IdentityManager.instance) {
            IdentityManager.instance = new IdentityManager()
            await IdentityManager.instance.initialize()
        }
        return IdentityManager.instance
    }

    public async initialize(): Promise<void> {
        const platformEnv = process.env.PLATFORM_TYPE?.toLowerCase()
        if (platformEnv === 'cloud') {
            this.currentInstancePlatform = Platform.CLOUD
        } else if (platformEnv === 'open_source' || platformEnv === 'open-source') {
            this.currentInstancePlatform = Platform.OPEN_SOURCE
        } else {
            this.currentInstancePlatform = Platform.IAM
        }
        this.permissions = new Permissions()
        if (process.env.STRIPE_SECRET_KEY) {
            this.stripeManager = await StripeManager.getInstance()
            this.billingManager = new BillingManager(this.stripeManager)
        }
    }

    public getPlatformType(): Platform {
        return this.currentInstancePlatform
    }

    public getPermissions(): Permissions {
        return this.permissions
    }

    public isIam(): boolean {
        return this.currentInstancePlatform === Platform.IAM
    }

    public isCloud(): boolean {
        return this.currentInstancePlatform === Platform.CLOUD
    }

    public isOpenSource(): boolean {
        return this.currentInstancePlatform === Platform.OPEN_SOURCE
    }

    public async getProductIdFromSubscription(subscriptionId: string): Promise<string> {
        if (this.currentInstancePlatform !== Platform.CLOUD) {
            return ''
        }
        if (!this.stripeManager) {
            return ''
        }
        return this.stripeManager.getProductIdFromSubscription(subscriptionId)
    }

    public async getFeaturesByPlan(subscriptionId: string): Promise<FeatureFlags> {
        if (this.currentInstancePlatform === Platform.IAM) {
            return IAM_FEATURE_FLAGS.reduce((acc, key) => {
                acc[key] = 'true'
                return acc
            }, {} as FeatureFlags)
        }
        if (this.currentInstancePlatform !== Platform.CLOUD) {
            return {}
        }
        if (!this.stripeManager) {
            return {}
        }
        return this.stripeManager.getFeaturesByPlan(subscriptionId)
    }

    public async createStripeCustomerPortalSession(req: Request): Promise<{ url: string }> {
        if (!this.billingManager) {
            throw new Error('Billing is not initialized')
        }
        return this.billingManager.createStripeCustomerPortalSession(req)
    }

    public async createStripeUserAndSubscribe(email: string, planId: string, referral?: string) {
        if (!this.billingManager) {
            throw new Error('Billing is not initialized')
        }
        return this.billingManager.createStripeUserAndSubscribe(email, planId, referral)
    }

    public async updateSubscriptionPlan(req: Request, subscriptionId: string, newPlanId: string, prorationDate: number) {
        if (!this.billingManager) {
            throw new Error('Billing is not initialized')
        }
        const result = await this.billingManager.updateSubscriptionPlan(subscriptionId, newPlanId, prorationDate)
        const cacheState = result.cacheState ?? (await this.refreshSubscriptionCache(subscriptionId))
        const productId = cacheState?.productId ?? (await this.getProductIdFromSubscription(subscriptionId))
        const features = cacheState?.features ?? (await this.getFeaturesByPlan(subscriptionId))
        this.updateSessionUser(req, {
            activeOrganizationProductId: productId,
            features
        })
        return result
    }

    public async updateAdditionalSeats(subscriptionId: string, quantity: number, prorationDate: number) {
        if (!this.billingManager) {
            throw new Error('Billing is not initialized')
        }
        return this.billingManager.updateAdditionalSeats(subscriptionId, quantity, prorationDate)
    }

    public async getPlanProration(subscriptionId: string, newPlanId: string) {
        if (!this.billingManager) {
            throw new Error('Billing is not initialized')
        }
        return this.billingManager.getPlanProration(subscriptionId, newPlanId)
    }

    public async getAdditionalSeatsProration(subscriptionId: string, newQuantity: number) {
        if (!this.billingManager) {
            throw new Error('Billing is not initialized')
        }
        return this.billingManager.getAdditionalSeatsProration(subscriptionId, newQuantity)
    }

    public async getRefreshToken(providerName: string, refreshToken: string) {
        const provider = this.ssoProviders.get(providerName)
        if (!provider) {
            return null
        }
        return provider.refreshToken(refreshToken)
    }

    public async refreshSubscriptionCache(subscriptionId: string) {
        if (!subscriptionId || this.currentInstancePlatform !== Platform.CLOUD) {
            return undefined
        }
        if (!this.billingManager) {
            throw new Error('Billing is not initialized')
        }
        return this.billingManager.refreshSubscriptionCache(subscriptionId)
    }

    private updateSessionUser(req: Request, updates: Partial<Record<string, any>>): void {
        if (!req?.user) return
        const updatedUser = { ...req.user, ...updates }
        if (req.session) {
            const session = req.session as any
            session.passport = session.passport ?? {}
            session.passport.user = updatedUser
        }
        req.user = updatedUser as any
    }

    public async initializeSSO(app: express.Application): Promise<void> {
        if (!this.isIam() && !this.isCloud()) {
            this.initializeEmptySSO(app)
            return
        }

        const loginMethodService = new LoginMethodService()
        let queryRunner
        try {
            queryRunner = getRunningExpressApp().AppDataSource.createQueryRunner()
            await queryRunner.connect()

            let organizationId = undefined
            if (this.isIam()) {
                const organizationService = new OrganizationService()
                const organizations = await organizationService.readOrganization(queryRunner)
                if (organizations.length > 0) {
                    organizationId = organizations[0].id
                } else {
                    this.initializeEmptySSO(app)
                    return
                }
            }

            const loginMethods = await loginMethodService.readLoginMethodByOrganizationId(organizationId, queryRunner)
            if (loginMethods && loginMethods.length > 0) {
                for (const method of loginMethods) {
                    if (method.status === LoginMethodStatus.ENABLE) {
                        const config = JSON.parse(await loginMethodService.decryptLoginMethodConfig(method.config))
                        this.initializeSsoProvider(app, method.name, config)
                    }
                }
            }
        } finally {
            if (queryRunner) {
                await queryRunner.release()
            }
        }

        this.initializeEmptySSO(app)
    }

    public initializeEmptySSO(app: express.Application): void {
        ALL_SSO_PROVIDERS.forEach((providerName) => {
            if (!this.ssoProviders.has(providerName)) {
                this.initializeSsoProvider(app, providerName, undefined)
            }
        })
    }

    public initializeSsoProvider(app: express.Application, providerName: string, providerConfig: any): void {
        if (this.ssoProviders.has(providerName)) {
            const provider = this.ssoProviders.get(providerName)
            provider?.setSSOConfig(providerConfig)
            provider?.initialize()
            return
        }

        let provider: SSOBase | undefined
        switch (providerName) {
            case 'azure':
                provider = new AzureSSO(app, providerConfig)
                break
            case 'google':
                provider = new GoogleSSO(app, providerConfig)
                break
            case 'auth0':
                provider = new Auth0SSO(app, providerConfig)
                break
            case 'github':
                provider = new GithubSSO(app, providerConfig)
                break
            default:
                provider = undefined
        }
        if (provider) {
            provider.initialize()
            this.ssoProviders.set(providerName, provider)
        }
    }

    public static checkFeatureByPlan(featureKey: string) {
        return async (req: any, res: any, next: any) => {
            try {
                const app = getRunningExpressApp()
                const identityManager = app?.identityManager
                if (!identityManager || !identityManager.isCloud()) {
                    next()
                    return
                }
                const subscriptionId = req.user?.activeOrganizationSubscriptionId ?? ''
                const featureFlags = await identityManager.getFeaturesByPlan(subscriptionId)
                if (!featureFlags || Object.keys(featureFlags).length === 0) {
                    res.status(StatusCodes.FORBIDDEN).json({ message: ErrorMessage.FORBIDDEN })
                    return
                }
                const flagValue = featureFlags[featureKey]
                const isEnabled = flagValue === 'true' || flagValue === '1'
                if (!isEnabled) {
                    res.status(StatusCodes.FORBIDDEN).json({ message: ErrorMessage.FORBIDDEN })
                    return
                }
                next()
            } catch (error) {
                next(error)
            }
        }
    }
}

export default IdentityManager
