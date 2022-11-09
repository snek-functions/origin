import { fn } from './factory'

import type { validateSecret as ValidateSecret } from '@snek-functions/shopify'

const validateSecret: typeof ValidateSecret = fn(
    async (args, _, { }) => {
        const { validateSecret } = await import('@snek-functions/shopify')

        return await validateSecret(args)
    },
    {
        name: 'shopifyValidateSecret',
    }
)

export default validateSecret
