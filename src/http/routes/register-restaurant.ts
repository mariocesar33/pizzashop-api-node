import { FastifyInstance } from 'fastify'

import { db } from '../../db/connection'
import { restaurants, users } from '../../db/schema'

export async function registerRestaurant(app: FastifyInstance) {
  app.post('/restaurants', async (request, reply) => {
    const { restaurantName, name, email, phone } = request.body as any

    const [manager] = await db
      .insert(users)
      .values({
        name,
        email,
        phone,
        role: 'manager',
      })
      .returning({ id: users.id })

    await db.insert(restaurants).values({
      name: restaurantName,
      managerId: manager.id,
    })

    return reply.status(204).send('ok')
  })
}
