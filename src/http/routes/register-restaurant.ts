import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { db } from '../../db/connection'
import { restaurants, users } from '../../db/schema'

export async function registerRestaurant(app: FastifyInstance) {
  app.post('/restaurants', async (request, reply) => {
    const registerRestaurantSchema = z.object({
      restaurantName: z.string(),
      managerName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      role: z.enum(['manager', 'customer']).default('manager'),
    })

    const { restaurantName, managerName, email, phone } =
      registerRestaurantSchema.parse(request.body)

    const [manager] = await db
      .insert(users)
      .values({
        name: managerName,
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
