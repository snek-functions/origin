import { fn } from './factory'

import type { allProductId as AllProductId } from '@snek-functions/shopify'

const allProductId: typeof AllProductId = fn(
    async (args, _, { }) => {
        const { allProductId } = await import('@snek-functions/shopify')

        return await allProductId(args)
    },
    {
        name: 'shopifyAllProductId',
    }
)

export default allProductId
