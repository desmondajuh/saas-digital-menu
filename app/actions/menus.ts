'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { menus, menuItems, establishments } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

async function verifyEstablishmentOwnership(establishmentId: string) {
  const userId = await getUserId()
  const establishment = await db
    .select()
    .from(establishments)
    .where(eq(establishments.id, establishmentId))
    .limit(1)

  if (!establishment[0] || establishment[0].userId !== userId) {
    throw new Error('Unauthorized')
  }

  return establishment[0]
}

export async function createMenu(data: {
  establishmentId: string
  name: string
  description?: string
}) {
  await verifyEstablishmentOwnership(data.establishmentId)

  const id = nanoid()

  await db.insert(menus).values({
    id,
    establishmentId: data.establishmentId,
    name: data.name,
    description: data.description,
  })

  revalidatePath(`/dashboard/establishments/${data.establishmentId}`)
  return id
}

export async function getMenus(establishmentId: string) {
  await verifyEstablishmentOwnership(establishmentId)

  return db
    .select()
    .from(menus)
    .where(eq(menus.establishmentId, establishmentId))
    .orderBy(desc(menus.createdAt))
}

export async function getMenuById(menuId: string) {
  const result = await db
    .select()
    .from(menus)
    .where(eq(menus.id, menuId))
    .limit(1)

  if (!result[0]) throw new Error('Menu not found')

  await verifyEstablishmentOwnership(result[0].establishmentId)
  return result[0]
}

export async function updateMenu(
  menuId: string,
  data: Partial<{ name: string; description: string; isActive: boolean }>
) {
  const menu = await getMenuById(menuId)

  await db
    .update(menus)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(menus.id, menuId))

  revalidatePath(`/dashboard/establishments/${menu.establishmentId}`)
}

export async function deleteMenu(menuId: string) {
  const menu = await getMenuById(menuId)

  // Delete menu items first
  await db.delete(menuItems).where(eq(menuItems.menuId, menuId))

  await db.delete(menus).where(eq(menus.id, menuId))

  revalidatePath(`/dashboard/establishments/${menu.establishmentId}`)
}

export async function createMenuItem(data: {
  menuId: string
  name: string
  description?: string
  price: number
  category?: string
  image?: string
}) {
  const menu = await getMenuById(data.menuId)

  const id = nanoid()

  await db.insert(menuItems).values({
    id,
    menuId: data.menuId,
    name: data.name,
    description: data.description,
    price: data.price.toString(),
    category: data.category,
    image: data.image,
  })

  revalidatePath(`/dashboard/menus/${data.menuId}`)
  return id
}

export async function getMenuItems(menuId: string) {
  const menu = await getMenuById(menuId)

  return db
    .select()
    .from(menuItems)
    .where(eq(menuItems.menuId, menuId))
    .orderBy(desc(menuItems.createdAt))
}

export async function getMenuItemById(itemId: string) {
  const result = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.id, itemId))
    .limit(1)

  if (!result[0]) throw new Error('Menu item not found')

  return result[0]
}

export async function updateMenuItem(
  itemId: string,
  data: Partial<{
    name: string
    description: string
    price: number
    category: string
    image: string
    isAvailable: boolean
  }>
) {
  const item = await getMenuItemById(itemId)
  const menu = await getMenuById(item.menuId)

  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  }

  if (data.price !== undefined) {
    updateData.price = data.price.toString()
  }

  await db.update(menuItems).set(updateData).where(eq(menuItems.id, itemId))

  revalidatePath(`/dashboard/menus/${item.menuId}`)
}

export async function deleteMenuItem(itemId: string) {
  const item = await getMenuItemById(itemId)

  await db.delete(menuItems).where(eq(menuItems.id, itemId))

  revalidatePath(`/dashboard/menus/${item.menuId}`)
}

export async function getPublicMenu(slug: string) {
  const establishment = await db
    .select()
    .from(establishments)
    .where(eq(establishments.slug, slug))
    .limit(1)

  if (!establishment[0]) return null

  const menus_ = await db
    .select()
    .from(menus)
    .where(eq(menus.establishmentId, establishment[0].id))

  const items = await db.select().from(menuItems)

  return {
    establishment: establishment[0],
    menus: menus_.map((menu) => ({
      ...menu,
      items: items.filter((item) => item.menuId === menu.id),
    })),
  }
}
