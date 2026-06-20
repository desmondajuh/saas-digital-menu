'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { establishments, menus } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import QRCode from 'qrcode'
import { nanoid } from 'nanoid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createEstablishment(data: {
  name: string
  slug: string
  description?: string
}) {
  const userId = await getUserId()

  // Generate QR code
  const qrCodeUrl = `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/restaurants/${data.slug}`
  const qrCode = await QRCode.toDataURL(qrCodeUrl)

  const id = nanoid()
  
  await db.insert(establishments).values({
    id,
    userId,
    name: data.name,
    slug: data.slug,
    description: data.description,
    qrCode,
  })

  revalidatePath('/dashboard')
  return { id, qrCode }
}

export async function getEstablishments() {
  const userId = await getUserId()
  return db
    .select()
    .from(establishments)
    .where(eq(establishments.userId, userId))
    .orderBy(desc(establishments.createdAt))
}

export async function getEstablishment(id: string) {
  const userId = await getUserId()
  const result = await db
    .select()
    .from(establishments)
    .where(eq(establishments.id, id))
    .limit(1)

  if (!result[0] || result[0].userId !== userId) {
    throw new Error('Establishment not found or unauthorized')
  }

  return result[0]
}

export async function getEstablishmentBySlug(slug: string) {
  const result = await db
    .select()
    .from(establishments)
    .where(eq(establishments.slug, slug))
    .limit(1)

  return result[0] || null
}

export async function updateEstablishment(
  id: string,
  data: Partial<{
    name: string
    description: string
    image: string
    telegramChatId: string
    telegramBotToken: string
    whatsappPhoneNumber: string
    pushNotificationEnabled: boolean
  }>
) {
  const userId = await getUserId()
  const establishment = await getEstablishment(id)

  await db
    .update(establishments)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(establishments.id, id))

  revalidatePath('/dashboard')
  return establishment
}

export async function deleteEstablishment(id: string) {
  const userId = await getUserId()
  const establishment = await getEstablishment(id)

  // Delete associated menus and items first
  const establishmentMenus = await db
    .select()
    .from(menus)
    .where(eq(menus.establishmentId, id))

  await db.delete(establishments).where(eq(establishments.id, id))

  revalidatePath('/dashboard')
}

export async function generateNewQRCode(id: string) {
  const userId = await getUserId()
  const establishment = await getEstablishment(id)

  const qrCodeUrl = `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/restaurants/${establishment.slug}`
  const qrCode = await QRCode.toDataURL(qrCodeUrl)

  await db
    .update(establishments)
    .set({ qrCode, updatedAt: new Date() })
    .where(eq(establishments.id, id))

  revalidatePath('/dashboard')
  return qrCode
}
