import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createId } from '@paralleldrive/cuid2'
import nodemailer from 'nodemailer' // Só porque estou usar o TestAccount

import { db } from '../../db/connection'
import { authLinks } from '../../db/schema'
import { env } from '../../env'
import { UnauthorizedError } from './errors/unauthorized-error'
import { createMailTransport } from '../../lib/mail'

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
      throw new UnauthorizedError()
    }

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      userId: userFromEmail.id,
      code: authLinkCode,
    })

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)
    // http://localhost:3333/auth-links/authenticate

    authLink.searchParams.set('code', authLinkCode)
    // http://localhost:3333/auth-links/authenticate?code=valordoauthLinkCode

    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)
    // http://localhost:3333/auth-links/authenticate?code=valordoauthLinkCode&redirect=umaurl

    // console.log(authLink.toString())

    const mailTransport = await createMailTransport()

    const info = await mailTransport.sendMail({
      from: {
        name: 'Zulmira pizza',
        address: 'zulmira@cv.com',
      },
      to: email,
      subject: 'Authenticate to Zulmira Pizza',
      // html
      text: `Use the following link to authenticate on Zulmira Pizza: ${authLink.toString()}`,
    })

    // console.log(info)
    console.log(nodemailer.getTestMessageUrl(info))
  })
}
