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
import Stripe from 'stripe'
import { StripeManager } from '../../StripeManager'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

export class StripeWebhookController {
    async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const signature = req.headers['stripe-signature']
            if (!signature || Array.isArray(signature)) {
                return res.status(400).json({ message: 'Missing stripe signature' })
            }
            const secret = process.env.STRIPE_WEBHOOK_SECRET
            if (!secret) {
                return res.status(400).json({ message: 'Missing webhook secret' })
            }

            const rawBody = (req as any).rawBody ?? req.body
            if (!rawBody) {
                return res.status(400).json({ message: 'Missing raw body' })
            }

            const stripe = (await StripeManager.getInstance()).getStripe()
            const event = stripe.webhooks.constructEvent(rawBody, signature, secret)

            if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
                const subscription = event.data.object as Stripe.Subscription
                const subscriptionId = subscription?.id
                if (subscriptionId) {
                    const identityManager = getRunningExpressApp().identityManager
                    if (identityManager?.refreshSubscriptionCache) {
                        await identityManager.refreshSubscriptionCache(subscriptionId)
                    }
                }
            }

            return res.status(200).json({ received: true })
        } catch (error) {
            next(error)
        }
    }
}

export default StripeWebhookController
