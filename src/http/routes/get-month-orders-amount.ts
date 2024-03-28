// Numero total de vendas dentro de um mês, e comparando com o mês anterior

import { FastifyInstance } from 'fastify'
import dayjs from 'dayjs'

import { UnauthorizedError } from './errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, count, eq, gte, sql } from 'drizzle-orm'

export async function getMonthOrdersAmount(app: FastifyInstance) {
  app.get('/metrics/month-orders-amount', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    // data atual
    const today = dayjs()

    // mês passado
    const lastMonth = today.subtract(1, 'month')

    // início do mês passado
    const startOfLastMonth = lastMonth.startOf('month')

    const ordersPerMonth = await db
      .select({
        // saber qual é o dia completo
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        // fazer as pontagens dos pedidos que eu peguei
        amount: count(),
      })
      .from(orders)
      .where(
        and(
          // pegar todos os pedidos desde ontem meia noite
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfLastMonth.toDate()),
        ),
      )
      // vou fazer um agrupamento pela data, quero total dos pedidos de ontem e de hoje separados
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)

    const currentMonthWithYear = today.format('YYYY-MM') // correnteAno-correnteMes
    const lastMonthWithYear = lastMonth.format('YYYY-MM') // correnteAno-mesPassado

    const currentMonthOrdersAmount = ordersPerMonth.find((ordersPerMonth) => {
      return ordersPerMonth.monthWithYear === currentMonthWithYear
    })

    const lastMonthOrdersAmount = ordersPerMonth.find((ordersPerMonth) => {
      return ordersPerMonth.monthWithYear === lastMonthWithYear
    })

    const diffFromLastMonth =
      currentMonthOrdersAmount && lastMonthOrdersAmount
        ? (currentMonthOrdersAmount.amount * 100) / lastMonthOrdersAmount.amount
        : null

    return reply.send({
      amount: currentMonthOrdersAmount?.amount || 0,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    })
  })
}
