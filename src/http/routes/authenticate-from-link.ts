import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'

import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'
import { UnauthorizedError } from './errors/unauthorized-error'

export async function authenticateFromLink(app: FastifyInstance) {
  app.get('/auth-links/authenticate', async (request, reply) => {
    const authenticateFromLinkQuerySchema = z.object({
      code: z.string(),
      redirect: z.string(),
    })

    const { code, redirect } = authenticateFromLinkQuerySchema.parse(
      request.query,
    )

    // Estou procurando o primeiro authLinks, onde o code da tabela for igual ao code que estou recebendo
    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) {
      throw new UnauthorizedError()
    }

    if (dayjs().diff(authLinkFromCode.createdAt, 'days') > 7) {
      throw new UnauthorizedError()
    }

    // procura se o usuário que esta autenticando na minha aplicação
    // se ele gerencia algum restaurante
    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    try {
      const token = await reply.jwtSign(
        { restaurantId: managedRestaurant?.id },
        {
          sign: {
            sub: authLinkFromCode.userId,
          },
        },
      )

      reply.setCookie('auth', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      await db.delete(authLinks).where(eq(authLinks.code, code))

      return reply.send({ token }).redirect(redirect)
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return reply.status(400).send({ message: err.message })
      }
    }
  })
}
