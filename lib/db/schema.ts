import { text, timestamp, boolean, pgTable, integer, decimal, unique } from 'drizzle-orm/pg-core'

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
})

// App Tables
export const establishments = pgTable('establishments', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  qrCode: text('qrCode'),
  telegramChatId: text('telegramChatId'),
  telegramBotToken: text('telegramBotToken'),
  whatsappPhoneNumber: text('whatsappPhoneNumber'),
  pushNotificationEnabled: boolean('pushNotificationEnabled').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const menus = pgTable('menus', {
  id: text('id').primaryKey(),
  establishmentId: text('establishmentId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(),
  menuId: text('menuId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  image: text('image'),
  category: text('category'),
  isAvailable: boolean('isAvailable').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  establishmentId: text('establishmentId').notNull(),
  customerName: text('customerName').notNull(),
  customerEmail: text('customerEmail').notNull(),
  customerPhone: text('customerPhone'),
  status: text('status').default('pending'),
  totalAmount: decimal('totalAmount', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('orderId').notNull(),
  menuItemId: text('menuItemId').notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
