// Trazer os 5 produtos que mais vendem na nossa empresa, e o total de vendas de cada um deles
import { FastifyInstance } from 'fastify'

import { db } from '../../db/connection'
import { UnauthorizedError } from './errors/unauthorized-error'
import { orderItems, orders, products } from '../../db/schema'
import { desc, eq, sum } from 'drizzle-orm'

export async function getPopularProducts(app: FastifyInstance) {
  app.get('/metrics/popular-products', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const popularProducts = await db
      .select({
        product: products.name,
        amount: sum(orderItems.quantity).mapWith(Number),
      })
      .from(orderItems)
      .leftJoin(orders, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orders.restaurantId, restaurantId))
      .groupBy(products.name)
      .orderBy((filds) => {
        return desc(filds.amount)
      })
      .limit(5)

    return reply.send(popularProducts)
  })
}
