import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'

import { env } from './env'
import chalk from 'chalk'

import { registerRestaurant } from './http/routes/register-restaurant'
import { sendAuthLink } from './http/routes/send-auth-link'

const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET_KEY,
})

app.register(fastifyCookie)

app.register(registerRestaurant)
app.register(sendAuthLink)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(chalk.bgGreen(`fastify: server running port:${env.PORT}`))
  })
