import { FastifyInstance } from 'fastify'
import dayjs from 'dayjs'

import { UnauthorizedError } from './errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, eq, gte, sql, sum } from 'drizzle-orm'

export async function getMonthReceipt(app: FastifyInstance) {
  app.get('/metrics/month-receipt', async (request, reply) => {
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

    // Vou pegar a receita do mês passado e a receita do corrente mês
    const monthsReceipts = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        receipt: sum(orders.totalInCents).mapWith(Number), // receita vai ser uma soma do 'orders.totalInCents', depois converter em numero
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfLastMonth.toDate()), // onde a data da criação do pedido seja maior ao igual ao início do mês passado
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`) // separa a soma 'receipt' em suas respetiva mêses

    const currentMonthWithYear = today.format('YYYY-MM') // correnteAno-correnteMes
    const lastMonthWithYear = lastMonth.format('YYYY-MM') // correnteAno-mesPassado

    const currentMonthReceipt = monthsReceipts.find((monthsReceipt) => {
      return monthsReceipt.monthWithYear === currentMonthWithYear
    })

    const lastMonthReceipt = monthsReceipts.find((monthsReceipt) => {
      return monthsReceipt.monthWithYear === lastMonthWithYear
    })

    // console.log(currentMonthReceipts, lastMonthReceipts)

    const diffFromLastMonth =
      currentMonthReceipt && lastMonthReceipt
        ? (currentMonthReceipt.receipt * 100) / lastMonthReceipt.receipt
        : null

    return reply.send({
      receipt: currentMonthReceipt?.receipt || 0,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    })
  })
}
// retorna a receita do mês atual, e retorna também quanto por cento a recita esta, (se a mais ao a menos) em relação ao mês anterior.
