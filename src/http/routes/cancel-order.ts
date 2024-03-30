import { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { UnauthorizedError } from './errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'

const cancelOrderParamsSchema = z.object({
  orderId: z.string(),
})

export async function cancelOrder(app: FastifyInstance) {
  app.patch('/orders/:orderId/cancel', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const { orderId } = cancelOrderParamsSchema.parse(request.params)

    const order = await db.query.orders.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!order) {
      return reply.status(400).send({ message: 'Order not found!' })
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return reply
        .status(400)
        .send({ message: 'You cannot cancel orders after dispatch.' })
    }

    await db
      .update(orders)
      .set({ status: 'canceled' })
      .where(eq(orders.id, orderId))
  })
}
