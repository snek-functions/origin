import { fn } from './factory'

import type { createProduct as CreateProduct } from '@snek-functions/shopify'

const createProduct: typeof CreateProduct = fn(
    async (args, _, { }) => {
        const { createProduct } = await import('@snek-functions/shopify')

        return await createProduct(args)
    },
    {
        name: 'shopifyCreateProduct',
    }
)

export default createProduct
