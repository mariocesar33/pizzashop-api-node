import { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { UnauthorizedError } from './errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'

const dispatchOrderParamsSchema = z.object({
  orderId: z.string(),
})

export async function dispatchOrder(app: FastifyInstance) {
  app.patch('/orders/:orderId/dispatch', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const { orderId } = dispatchOrderParamsSchema.parse(request.params)

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

    if (order.status !== 'processing') {
      return reply.status(400).send({
        message:
          'You cannot dispatch orders that are not in "processing" status.',
      })
    }

    await db
      .update(orders)
      .set({ status: 'delivering' })
      .where(eq(orders.id, orderId))
  })
}
