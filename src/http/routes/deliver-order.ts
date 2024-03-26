import { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { UnauthorizedError } from './errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'

export async function deliverOrder(app: FastifyInstance) {
  app.patch('/orders/:orderId/deliver', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const deliverOrderParamsSchema = z.object({
      orderId: z.string(),
    })

    const { orderId } = deliverOrderParamsSchema.parse(request.params)

    const order = await db.query.orders.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!order) {
      return reply.status(400).send({ message: 'Order not found!' })
    }

    if (order.status !== 'delivering') {
      return reply.status(400).send({
        message:
          'You cannot deliver orders that are not in "delivering" status.',
      })
    }

    await db
      .update(orders)
      .set({ status: 'delivered' })
      .where(eq(orders.id, orderId))
  })
}
