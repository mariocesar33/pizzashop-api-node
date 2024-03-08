/* eslint-disable drizzle/enforce-delete-with-where */
import { faker } from '@faker-js/faker'
import { users, restaurants } from './schema'
import { db } from './connection'
import chalk from 'chalk'

async function run() {
  /**
   * Reset database
   */
  await db.delete(restaurants)
  await db.delete(users)

  console.log(chalk.yellow('👌Database reset!'))

  /**
   * create customers
   */
  await db.insert(users).values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  ])

  console.log(chalk.yellow('👌Create customers!'))

  /**
   * create manager
   */
  const [manager] = await db
    .insert(users)
    .values([
      {
        name: faker.person.fullName(),
        email: 'mario@cv.com',
        role: 'manager',
      },
    ])
    .returning({
      id: users.id,
    })

  console.log(chalk.yellow('👌Create manager!'))

  /**
   * create restaurant
   */
  await db.insert(restaurants).values([
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  ])

  console.log(chalk.yellow('👌Create restaurant!'))

  console.log(chalk.greenBright('Database seeded successfuly!'))

  process.exit()
}

run().catch(async (err) => {
  console.error(err)
  process.exit(1)
})
