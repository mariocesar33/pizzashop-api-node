import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'

import chalk from 'chalk'

import { env } from './env'
import { registerRestaurant } from './http/routes/register-restaurant'
import { sendAuthLink } from './http/routes/send-auth-link'
import { authenticateFromLink } from './http/routes/authenticate-from-link'
import { getProfile } from './http/routes/get-profile'
import { getManagedRestaurant } from './http/routes/get-managed-restaurant'
import { getOrderDetails } from './http/routes/get-order-details'

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
app.register(getOrderDetails)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(chalk.bgGreen(`fastify: server running port:${env.PORT}`))
  })
