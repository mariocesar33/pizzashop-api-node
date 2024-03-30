import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { UnauthorizedError } from './errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { eq } from 'drizzle-orm'

const getOrderDetailsParamsSchema = z.object({
  orderId: z.string(),
})

export async function approveOrder(app: FastifyInstance) {
  app.patch('/orders/:orderId/approve', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const { orderId } = getOrderDetailsParamsSchema.parse(request.params)

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!order) {
      return reply.status(400).send({ message: 'Order not found!' })
    }

    if (order.status !== 'pending') {
      return reply
        .status(400)
        .send({ message: 'You can only approve pending orders.' })
    }

    await db
      .update(orders)
      .set({ status: 'processing' })
      .where(eq(orders.id, orderId))
  })
}
