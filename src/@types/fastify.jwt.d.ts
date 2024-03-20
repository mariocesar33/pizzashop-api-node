import '@fastify/jwt'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    payload: { restaurantId?: string }
    user: {
      sub: string
      restaurantId?: string
    }
  }
}
