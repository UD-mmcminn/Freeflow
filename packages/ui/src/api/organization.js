import client from '@/api/client'

const setupOrganization = (body) => client.post('/organization/setup', body)

export default {
    setupOrganization
}
