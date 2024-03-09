import fastify from 'fastify'

import { env } from './env'
import { registerRestaurant } from './http/routes/register-restaurant'
import { sendAuthLink } from './http/routes/send-auth-link'

const app = fastify()

app.register(registerRestaurant)
app.register(sendAuthLink)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(`fastify: server running port:${env.PORT}`)
  })
