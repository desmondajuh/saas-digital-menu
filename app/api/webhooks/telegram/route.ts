import { db } from '@/lib/db'
import { establishments, orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { establishmentId, orderId, customerName, itemCount, totalAmount } = body

    // Fetch establishment with Telegram config
    const establishment = await db
      .select()
      .from(establishments)
      .where(eq(establishments.id, establishmentId))
      .limit(1)

    if (!establishment[0] || !establishment[0].telegramChatId || !establishment[0].telegramBotToken) {
      return new Response(JSON.stringify({ success: false, message: 'Telegram not configured' }), {
        status: 400,
      })
    }

    const message = `
🔔 <b>New Order Received!</b>

<b>Order ID:</b> ${orderId.slice(0, 8)}
<b>Customer:</b> ${customerName}
<b>Items:</b> ${itemCount}
<b>Total:</b> $${totalAmount.toFixed(2)}

<a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/establishments/${establishmentId}/orders">View Order</a>
    `.trim()

    // Send Telegram message
    await axios.post(
      `https://api.telegram.org/bot${establishment[0].telegramBotToken}/sendMessage`,
      {
        chat_id: establishment[0].telegramChatId,
        text: message,
        parse_mode: 'HTML',
      }
    )

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
    })
  }
}
