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
import { Request } from 'express'
import { StripeManager } from '../../StripeManager'
import { UsageCacheManager } from '../../UsageCacheManager'

export type FeatureFlags = Record<string, string>

export class BillingManager {
    private stripeManager: StripeManager

    constructor(stripeManager: StripeManager) {
        this.stripeManager = stripeManager
    }

    public async createStripeCustomerPortalSession(req: Request): Promise<{ url: string }> {
        return this.stripeManager.createStripeCustomerPortalSession(req)
    }

    public async getPlanProration(subscriptionId: string, newPlanId: string) {
        if (!subscriptionId || !newPlanId) {
            throw new Error('Subscription id and plan id are required')
        }
        return this.stripeManager.getPlanProration(subscriptionId, newPlanId)
    }

    public async getAdditionalSeatsProration(subscriptionId: string, newQuantity: number) {
        if (!subscriptionId) {
            throw new Error('Subscription id is required')
        }
        if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
            throw new Error('Quantity must be a positive integer')
        }
        return this.stripeManager.getAdditionalSeatsProration(subscriptionId, newQuantity)
    }

    public async createStripeUserAndSubscribe(email: string, planId: string, referral?: string) {
        if (!email) {
            throw new Error('Email is required')
        }
        if (!planId) {
            throw new Error('Plan id is required')
        }
        const stripe = this.stripeManager.getStripe()

        const customer = await stripe.customers.create({
            email,
            metadata: referral ? { referral } : undefined
        })

        const prices = await stripe.prices.list({
            product: planId,
            active: true,
            limit: 1
        })
        if (prices.data.length === 0) {
            throw new Error('No active price found for the selected plan')
        }

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    price: prices.data[0].id
                }
            ]
        })

        await this.refreshSubscriptionCache(subscription.id)

        return { customerId: customer.id, subscriptionId: subscription.id }
    }

    public async updateSubscriptionPlan(subscriptionId: string, newPlanId: string, prorationDate: number) {
        if (!subscriptionId || !newPlanId) {
            throw new Error('Subscription id and plan id are required')
        }
        const result = await this.stripeManager.updateSubscriptionPlan(subscriptionId, newPlanId, prorationDate)
        const cacheState = await this.refreshSubscriptionCache(subscriptionId)
        return { ...result, cacheState }
    }

    public async updateAdditionalSeats(subscriptionId: string, quantity: number, prorationDate: number) {
        if (!subscriptionId) {
            throw new Error('Subscription id is required')
        }
        if (!Number.isInteger(quantity) || quantity < 0) {
            throw new Error('Quantity must be a non-negative integer')
        }
        const result = await this.stripeManager.updateAdditionalSeats(subscriptionId, quantity, prorationDate)
        const cacheState = await this.refreshSubscriptionCache(subscriptionId)
        return { ...result, cacheState }
    }

    public async refreshSubscriptionCache(subscriptionId: string) {
        const stripe = this.stripeManager.getStripe()
        const cacheManager = await UsageCacheManager.getInstance()

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const items = subscription.items.data
        const productId = items.length > 0 ? (items[0].price.product as string) : ''

        await cacheManager.updateSubscriptionDataToCache(subscriptionId, {
            productId,
            subsriptionDetails: this.stripeManager.getSubscriptionObject(subscription)
        })

        const features = await this.stripeManager.getFeaturesByPlan(subscriptionId, true)
        const quotas = await cacheManager.getQuotas(subscriptionId, true)

        return { productId, features, quotas }
    }
}

export default BillingManager
