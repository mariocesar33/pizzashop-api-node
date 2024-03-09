import fastify from 'fastify'

import { env } from './env'
import { registerRestaurant } from './http/routes/register-restaurant'

const app = fastify()

app.register(registerRestaurant)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('fastify: server running port:3334')
  })
