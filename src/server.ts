import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'

import { env } from './env'
import chalk from 'chalk'

import { registerRestaurant } from './http/routes/register-restaurant'
import { sendAuthLink } from './http/routes/send-auth-link'
import { authenticateFromLink } from './http/routes/authenticate-from-link'
import { getProfile } from './http/routes/get-profile'
import { getManagedRestaurant } from './http/routes/get-managed-restaurant'

const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET_KEY,
  cookie: {
    cookieName: 'auth',
    signed: false,
  },
})

app.register(fastifyCookie)

app.register(registerRestaurant)
app.register(sendAuthLink)
app.register(authenticateFromLink)
app.register(getProfile)
app.register(getManagedRestaurant)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(chalk.bgGreen(`fastify: server running port:${env.PORT}`))
  })
