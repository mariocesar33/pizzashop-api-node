import { FastifyInstance } from 'fastify'

import { db } from '../../db/connection'

export async function getProfile(app: FastifyInstance) {
  app.get('/me', async (request, reply) => {
    await request.jwtVerify()

    const userId = request.user.sub

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId)
      },
    })

    if (!user) {
      throw new Error('User not found.')
    }

    return reply.status(200).send(user)
  })
}
