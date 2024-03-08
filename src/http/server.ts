import 'dotenv/config'

import fastify from "fastify"
import { env } from '../env'

const app = fastify()

app.get('/', () => {
  return 'Olá node'
})

app.listen({
  port: env.PORT
}).then(() => {
  console.log('fastify: server running port:3334')
})