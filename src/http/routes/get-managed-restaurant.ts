import { FastifyInstance } from 'fastify'

import { db } from '../../db/connection'
import { NotAManagerError } from './errors/not-a-manager-error'

export async function getManagedRestaurant(app: FastifyInstance) {
  app.get('/managed-restaurant', async (request, reply) => {
    await request.jwtVerify()

    const restaurantId = request.user.restaurantId

    if (!restaurantId) {
      throw new NotAManagerError()
    }

    const restaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, restaurantId)
      },
    })

    if (!restaurant) {
      throw new Error('Restaurant not found.')
    }

    return reply.send({ restaurant })
  })
}
