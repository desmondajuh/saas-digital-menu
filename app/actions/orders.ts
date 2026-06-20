'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, establishments, menuItems } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createOrder(data: {
  establishmentId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: Array<{ menuItemId: string; quantity: number }>
  notes?: string
}) {
  const id = nanoid()
  let totalAmount = 0

  // Calculate total and validate items
  for (const item of data.items) {
    const menuItem = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, item.menuItemId))
      .limit(1)

    if (!menuItem[0]) throw new Error('Menu item not found')

    totalAmount += parseFloat(menuItem[0].price) * item.quantity
  }

  // Create order
  await db.insert(orders).values({
    id,
    establishmentId: data.establishmentId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    totalAmount: totalAmount.toString(),
    notes: data.notes,
    status: 'pending',
  })

  // Create order items
  for (const item of data.items) {
    const menuItem = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, item.menuItemId))
      .limit(1)

    await db.insert(orderItems).values({
      id: nanoid(),
      orderId: id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: menuItem[0].price,
    })
  }

  revalidatePath(`/restaurants/${data.establishmentId}/orders`)

  // Trigger notifications
  const establishment = await db
    .select()
    .from(establishments)
    .where(eq(establishments.id, data.establishmentId))
    .limit(1)

  if (establishment[0]?.telegramChatId && establishment[0]?.telegramBotToken) {
    // Send Telegram notification (will implement separately)
    sendTelegramNotification(establishment[0], {
      orderId: id,
      customerName: data.customerName,
      items: data.items.length,
      totalAmount,
    })
  }

  if (establishment[0]?.pushNotificationEnabled) {
    // Push notification trigger (will implement separately)
    triggerPushNotification(data.establishmentId, {
      title: 'New Order',
      body: `Order from ${data.customerName}`,
    })
  }

  return id
}

export async function getEstablishmentOrders(establishmentId: string) {
  const userId = await getUserId()

  const establishment = await db
    .select()
    .from(establishments)
    .where(eq(establishments.id, establishmentId))
    .limit(1)

  if (!establishment[0] || establishment[0].userId !== userId) {
    throw new Error('Unauthorized')
  }

  const orders_ = await db
    .select()
    .from(orders)
    .where(eq(orders.establishmentId, establishmentId))
    .orderBy(desc(orders.createdAt))

  // Get items for each order
  const ordersWithItems = await Promise.all(
    orders_.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id))

      return { ...order, items }
    })
  )

  return ordersWithItems
}

export async function getOrder(orderId: string) {
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!result[0]) throw new Error('Order not found')

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  return { ...result[0], items }
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
) {
  const userId = await getUserId()
  const order = await getOrder(orderId)

  const establishment = await db
    .select()
    .from(establishments)
    .where(eq(establishments.id, order.establishmentId))
    .limit(1)

  if (!establishment[0] || establishment[0].userId !== userId) {
    throw new Error('Unauthorized')
  }

  await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId))

  revalidatePath(`/dashboard/establishments/${order.establishmentId}/orders`)

  return order
}

// Helper functions for notifications
async function sendTelegramNotification(
  establishment: any,
  orderData: { orderId: string; customerName: string; items: number; totalAmount: number }
) {
  // Will implement Telegram notification logic
  try {
    const message = `
🔔 New Order Received!
Order ID: ${orderData.orderId}
Customer: ${orderData.customerName}
Items: ${orderData.items}
Total: $${orderData.totalAmount.toFixed(2)}
    `.trim()

    // Telegram API call would go here
  } catch (error) {
    console.error('Failed to send Telegram notification:', error)
  }
}

async function triggerPushNotification(establishmentId: string, data: any) {
  // Will implement push notification logic
  try {
    // Push notification logic would go here
  } catch (error) {
    console.error('Failed to send push notification:', error)
  }
}
