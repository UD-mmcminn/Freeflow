export interface OrganizationSetupRequestBody {
    organization: { name: string; subscriptionId?: string; customerId?: string; productId?: string }
    user?: { email?: string; name?: string; firstName?: string; lastName?: string }
    workspace?: { id?: string; name?: string; isPersonal?: boolean }
    role?: { id?: string; name?: string; permissions?: string[] }
}
