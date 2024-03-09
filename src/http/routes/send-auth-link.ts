import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createId } from '@paralleldrive/cuid2'

import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'
import { env } from '../../env'

export async function sendAuthLink(app: FastifyInstance) {
  app.post('/authenticate', async (request) => {
    const sendAuthLinkSchema = z.object({
      email: z.string().email(),
    })

    const { email } = sendAuthLinkSchema.parse(request.body)

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (!userFromEmail) {
      throw new Error('User not found.')
    }

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      userId: userFromEmail.id,
      code: authLinkCode,
    })

    // Enviar um e-mail

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)
    // http://localhost:3333/auth-links/authenticate

    authLink.searchParams.set('code', authLinkCode)
    // http://localhost:3333/auth-links/authenticate?code=valordoauthLinkCode

    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)
    // http://localhost:3333/auth-links/authenticate?code=valordoauthLinkCode&redirect=umaurl

    console.log(authLink.toString())
  })
}
