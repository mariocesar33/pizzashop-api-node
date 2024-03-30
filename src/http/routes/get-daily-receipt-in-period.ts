// vai receber um periudo com data de inicio e data de fim, vai retorna receita
// diaria dentro daquele periudo
import { FastifyInstance } from 'fastify'
import dayjs from 'dayjs'
import { z } from 'zod'

import { UnauthorizedError } from './errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, eq, gte, lte, sql, sum } from 'drizzle-orm'

const getDailyReceiptInPeriodQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

export async function getDailyReceiptInPeriod(app: FastifyInstance) {
  app.get('/metrics/daily-receipt-in-period', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const { from, to } = getDailyReceiptInPeriodQuerySchema.parse(request.query)

    const startDate = from ? dayjs(from) : dayjs().subtract(7, 'days')
    const endDate = to ? dayjs(to) : from ? startDate.add(7, 'days') : dayjs()

    if (endDate.diff(startDate, 'days') > 7) {
      return reply.status(400).send({
        message: 'You cannot list receipt in a large period than 7 days.',
      })
    }

    const receiptPerDay = await db
      .select({
        date: sql<string>`TO_CHAR(${orders.createdAt}, 'DD/MM')`,
        receipt: sum(orders.totalInCents).mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(
            orders.createdAt,
            startDate
              .startOf('day')
              .add(startDate.utcOffset(), 'minutes')
              .toDate(),
          ),
          lte(
            orders.createdAt,
            endDate.endOf('day').add(startDate.utcOffset(), 'minutes').toDate(),
          ),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`)

    const orderedReceiptPerDay = receiptPerDay.sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number)
      const [dayB, monthB] = b.date.split('/').map(Number)

      if (monthA === monthB) {
        return dayA - dayB
      } else {
        const dateA = new Date(2024, monthA - 1)
        const dateB = new Date(2024, monthB - 1)

        return dateA.getTime() - dateB.getTime()
      }
    })

    return reply.send(orderedReceiptPerDay)
  })
}
