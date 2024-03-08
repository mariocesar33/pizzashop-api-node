import 'dotenv/config'

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import chalk from 'chalk'

import { env } from '../env';

async function main() {
  const connection = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(connection);

  await migrate(db, { migrationsFolder: 'drizzle' });

  console.log(chalk.greenBright('Migrations applied successful!'))

  await connection.end();

  process.exit();
}

// Chamando a função assíncrona imediatamente, já que o node não suporta o top-level await
main().catch((error) => {
  console.error('Erro no código principal:', error);
  process.exit(1);
});