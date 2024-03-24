import { createId } from '@paralleldrive/cuid2'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

import { restaurants, orderItems } from '.'

export const products = pgTable('products', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  restaurantId: text('restaurant_id')
    .references(() => restaurants.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  priceInCents: integer('price_in_cents').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const productsRelations = relations(products, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [products.restaurantId],
    references: [restaurants.id],
    relationName: 'productRestaurant',
  }),
  orderItems: many(orderItems),
}))
