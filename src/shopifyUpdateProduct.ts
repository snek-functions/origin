import { fn } from './factory'

import type { updateProduct as UpdateProduct } from '@snek-functions/shopify'

const updateProduct: typeof UpdateProduct = fn(
    async (args, _, { }) => {
        const { updateProduct } = await import('@snek-functions/shopify')

        return await updateProduct(args)
    },
    {
        name: 'shopifyUpdateProduct',
    }
)

export default updateProduct
