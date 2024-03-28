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
import { approveOrder } from './http/routes/approve-order'
import { cancelOrder } from './http/routes/cancel-order'
import { deliverOrder } from './http/routes/deliver-order'
import { dispatchOrder } from './http/routes/dispatch-order'
import { getOrders } from './http/routes/get-orders'
import { getMonthReceipt } from './http/routes/get-month-receipt'
import { getDayOrdersAmount } from './http/routes/get-day-orders-amaunt'
import { getMonthOrdersAmount } from './http/routes/get-month-orders-amount'
import { getMonthCanceledOrdersAmount } from './http/routes/get-month-canceled-orders-amount'
import { getPopularProducts } from './http/routes/get-popular-products'

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
app.register(approveOrder)
app.register(cancelOrder)
app.register(deliverOrder)
app.register(dispatchOrder)
app.register(getOrders)
app.register(getMonthReceipt)
app.register(getDayOrdersAmount)
app.register(getMonthOrdersAmount)
app.register(getMonthCanceledOrdersAmount)
app.register(getPopularProducts)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(chalk.bgGreen(`fastify: server running port:${env.PORT}`))
  })
