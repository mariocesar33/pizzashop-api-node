import { FastifyInstance } from 'fastify'
import dayjs from 'dayjs'

import { UnauthorizedError } from './errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, count, eq, gte, sql } from 'drizzle-orm'

export async function getDayOrdersAmount(app: FastifyInstance) {
  app.get('/metrics/day-orders-amount', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const today = dayjs()
    const yesterday = today.subtract(1, 'day') // ontem
    const startOfYesterday = yesterday.startOf('day') // vai iniciar o ontem apartir do meia noite

    const orderPerDay = await db
      .select({
        // saber qual é o dia completo
        dayWithMonthAndYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        // fazer as pontagens dos pedidos que eu peguei
        amount: count(),
      })
      .from(orders)
      .where(
        and(
          // pegar todos os pedidos desde ontem meia noite
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfYesterday.toDate()),
        ),
      )
      // vou fazer um agrupamento pela data, quero total dos pedidos de ontem e de hoje separados
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)

    const todayWithMonthAndYear = today.format('YYYY-MM-DD')
    const yesterdayWithMonthAndYear = yesterday.format('YYYY-MM-DD')

    const todayOrdersAmount = orderPerDay.find((orderPerDay) => {
      return orderPerDay.dayWithMonthAndYear === todayWithMonthAndYear
    })

    const yesterdayOrdersAmount = orderPerDay.find((orderPerDay) => {
      return orderPerDay.dayWithMonthAndYear === yesterdayWithMonthAndYear
    })

    const diffFromYesterday =
      todayOrdersAmount && yesterdayOrdersAmount
        ? (todayOrdersAmount.amount * 100) / yesterdayOrdersAmount.amount
        : null

    return reply.send({
      amount: todayOrdersAmount?.amount || 0,
      diffFromLastMonth: diffFromYesterday
        ? Number((diffFromYesterday - 100).toFixed(2))
        : 0,
    })
  })
}
