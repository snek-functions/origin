import { fn } from './factory'

import type { deleteProduct as DeleteProduct } from '@snek-functions/shopify'

const deleteProduct: typeof DeleteProduct = fn(
    async (args, _, { }) => {
        const { deleteProduct } = await import('@snek-functions/shopify')

        return await deleteProduct(args)
    },
    {
        name: 'shopifyDeleteProduct',
    }
)

export default deleteProduct
