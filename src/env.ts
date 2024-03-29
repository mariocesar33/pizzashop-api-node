import 'dotenv/config'

import chalk from 'chalk'

import { z } from 'zod'

const envSchema = z.object({
  API_BASE_URL: z.string().url().min(1),
  AUTH_REDIRECT_URL: z.string().url().min(1),
  DATABASE_URL: z.string().url().min(1),
  JWT_SECRET_KEY: z.string().min(1),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('❌ Ivalid environment variables!', _env.error.format())

  throw new Error(chalk.redBright('Invalid environment variables.'))
}

export const env = _env.data
