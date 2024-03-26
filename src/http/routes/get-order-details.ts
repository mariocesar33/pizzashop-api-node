import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { UnauthorizedError } from './errors/unauthorized-error'
import { db } from '../../db/connection'

export async function getOrderDetails(app: FastifyInstance) {
  app.get('/orders/:orderId', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const getOrderDetailsParamsSchema = z.object({
      orderId: z.string(),
    })

    const { orderId } = getOrderDetailsParamsSchema.parse(request.params)

    const order = await db.query.orders.findFirst({
      columns: {
        id: true,
        status: true,
        totalInCents: true,
        createdAt: true,
      },
      with: {
        customer: {
          columns: {
            name: true,
            phone: true,
            email: true,
          },
        },
        orderItems: {
          columns: {
            id: true,
            priceInCents: true,
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!order) {
      return reply.status(400).send({ message: 'Order not found' })
    }

    return reply.send(order)
  })
}
