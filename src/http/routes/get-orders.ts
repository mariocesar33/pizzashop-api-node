import { FastifyInstance } from 'fastify'
import { and, count, eq, getTableColumns, ilike } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../db/connection'
import { UnauthorizedError } from './errors/unauthorized-error'
import { orders, users } from '../../db/schema'

const getOrdersQuerySchema = z.object({
  customerName: z.string().optional(),
  orderId: z.string().optional(),
  status: z
    .enum(['pending', 'processing', 'delivering', 'delivered', 'canceled'])
    .optional(),
  pageIndex: z.coerce.number().min(0).default(0),
})

export async function getOrders(app: FastifyInstance) {
  app.get('/orders', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const { customerName, orderId, status, pageIndex } =
      getOrdersQuerySchema.parse(request.query)

    const orderTableColumns = getTableColumns(orders)

    const baseQuery = db
      .select(orderTableColumns)
      .from(orders)
      .innerJoin(users, eq(users.id, orders.customerId))
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          orderId ? ilike(orders.id, `%${orderId}%`) : undefined,
          status ? eq(orders.status, status) : undefined,
          customerName ? ilike(users.name, `%${customerName}%`) : undefined,
        ),
      )

    const perPage = 10

    const [amountOfOrdersQuery, allOrders] = await Promise.all([
      db.select({ count: count() }).from(baseQuery.as('baseQuery')),
      await db
        .select()
        .from(baseQuery.as('baseQuery'))
        .offset(pageIndex * perPage)
        .limit(perPage),
    ])

    const amountOfOrders = amountOfOrdersQuery[0].count

    return reply.send({
      orders: allOrders,
      meta: {
        pageIndex,
        perPage,
        totalCount: amountOfOrders,
      },
    })
  })
}
