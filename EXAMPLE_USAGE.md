# Digital Menu SaaS - Example Usage

This guide shows how to use the Digital Menu SaaS application through actual examples.

## Example 1: Owner Signup and Onboarding

### Step 1: User Signs Up
```bash
POST http://localhost:3000/api/auth/signup
{
  "email": "john@restaurant.com",
  "password": "SecurePassword123!",
  "name": "John Smith"
}
```

The app will:
1. Validate email format
2. Hash password
3. Create user in database
4. Create session
5. Redirect to `/dashboard`

### Step 2: Owner Creates First Establishment
```typescript
// In client: app/dashboard/page.tsx
import { createEstablishment } from '@/app/actions/establishments'

const result = await createEstablishment({
  name: "The Italian Kitchen",
  slug: "italian-kitchen",
  description: "Authentic Italian cuisine in downtown area"
})

// Returns:
// {
//   id: "abc123xyz...",
//   qrCode: "data:image/png;base64,iVBORw0KGgo..."
// }
```

The app will:
1. Verify user is authenticated
2. Generate QR code pointing to: `http://localhost:3000/restaurants/italian-kitchen`
3. Store establishment in database
4. Return QR code as data URL

### Step 3: Owner Creates Menu
```typescript
import { createMenu } from '@/app/actions/menus'

const menuId = await createMenu({
  establishmentId: "abc123xyz...",
  name: "Main Menu",
  description: "Our signature dishes"
})

// Returns: "menu_001xyz..."
```

### Step 4: Owner Adds Menu Items
```typescript
import { createMenuItem } from '@/app/actions/menus'

await createMenuItem({
  menuId: "menu_001xyz...",
  name: "Spaghetti Carbonara",
  description: "Classic Roman pasta with eggs, cheese, and pancetta",
  price: 14.99,
  category: "Pasta",
  image: "https://example.com/carbonara.jpg"
})

await createMenuItem({
  menuId: "menu_001xyz...",
  name: "Margherita Pizza",
  description: "Fresh mozzarella, basil, and tomato",
  price: 12.99,
  category: "Pizza",
  image: "https://example.com/margherita.jpg"
})
```

### Step 5: Owner Configures Telegram
```typescript
import { updateEstablishment } from '@/app/actions/establishments'

await updateEstablishment("abc123xyz...", {
  telegramBotToken: "1234567890:ABCDEFGHIJKLMNOpqrst",
  telegramChatId: "987654321",
  pushNotificationEnabled: true
})
```

The owner can now receive order notifications!

---

## Example 2: Customer Places Order

### Step 1: Customer Scans QR Code
Browser navigates to:
```
http://localhost:3000/restaurants/italian-kitchen
```

The app:
1. Detects the QR code destination
2. Looks up establishment by slug
3. Redirects to: `http://localhost:3000/italian-kitchen/menu`

### Step 2: Customer Views Menu
```
GET http://localhost:3000/italian-kitchen/menu
```

The app returns (via `getPublicMenu(slug)`):
```json
{
  "establishment": {
    "id": "abc123xyz...",
    "name": "The Italian Kitchen",
    "slug": "italian-kitchen",
    "description": "Authentic Italian cuisine in downtown area"
  },
  "menus": [
    {
      "id": "menu_001xyz...",
      "name": "Main Menu",
      "description": "Our signature dishes",
      "items": [
        {
          "id": "item_001xyz...",
          "name": "Spaghetti Carbonara",
          "price": "14.99",
          "category": "Pasta",
          "description": "Classic Roman pasta..."
        },
        {
          "id": "item_002xyz...",
          "name": "Margherita Pizza",
          "price": "12.99",
          "category": "Pizza",
          "description": "Fresh mozzarella..."
        }
      ]
    }
  ]
}
```

### Step 3: Customer Builds Order
```typescript
// In browser: app/[slug]/menu/page.tsx
// Customer adds to cart
const cartItems = [
  {
    menuItemId: "item_001xyz...",
    name: "Spaghetti Carbonara",
    price: 14.99,
    quantity: 2  // 2 orders
  },
  {
    menuItemId: "item_002xyz...",
    name: "Margherita Pizza",
    price: 12.99,
    quantity: 1  // 1 pizza
  }
]

// Total: (14.99 × 2) + (12.99 × 1) = 42.97
```

### Step 4: Customer Submits Order
```typescript
import { createOrder } from '@/app/actions/orders'

const orderId = await createOrder({
  establishmentId: "abc123xyz...",
  customerName: "Maria Rossi",
  customerEmail: "maria@example.com",
  customerPhone: "+1-555-0123",
  items: [
    { menuItemId: "item_001xyz...", quantity: 2 },
    { menuItemId: "item_002xyz...", quantity: 1 }
  ],
  notes: "No onions, extra cheese on pizza"
})

// Returns: "order_abc123..."
```

The app:
1. Creates order record
2. Creates order_items records
3. Calculates total ($42.97)
4. Sends Telegram notification to owner
5. Shows confirmation to customer

---

## Example 3: Owner Receives and Manages Order

### Step 1: Telegram Notification Arrives

Owner receives in Telegram:
```
🔔 New Order Received!

Order ID: order_ab
Customer: Maria Rossi
Items: 3
Total: $42.97

[View Order]
```

### Step 2: Owner Views Orders Dashboard
```typescript
import { getEstablishmentOrders } from '@/app/actions/orders'

const orders = await getEstablishmentOrders("abc123xyz...")

// Returns:
[
  {
    id: "order_abc123...",
    establishmentId: "abc123xyz...",
    customerName: "Maria Rossi",
    customerEmail: "maria@example.com",
    customerPhone: "+1-555-0123",
    totalAmount: "42.97",
    notes: "No onions, extra cheese on pizza",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    items: [
      {
        id: "item_001xyz...",
        orderId: "order_abc123...",
        menuItemId: "item_001xyz...",
        quantity: 2,
        price: "14.99"
      },
      {
        id: "item_002xyz...",
        orderId: "order_abc123...",
        menuItemId: "item_002xyz...",
        quantity: 1,
        price: "12.99"
      }
    ]
  }
]
```

### Step 3: Owner Updates Order Status
```typescript
import { updateOrderStatus } from '@/app/actions/orders'

// Order received and confirmed
await updateOrderStatus("order_abc123...", "confirmed")

// Order is being prepared
await updateOrderStatus("order_abc123...", "preparing")

// Order is ready for pickup
await updateOrderStatus("order_abc123...", "ready")

// Order completed
await updateOrderStatus("order_abc123...", "completed")
```

Each status change:
1. Updates database
2. Revalidates dashboard
3. Updates order list in real-time

---

## Example 4: Multiple Establishments

Owner with pizza and pasta chains:

### Create Two Establishments
```typescript
const pizzeria = await createEstablishment({
  name: "Pizza Palace",
  slug: "pizza-palace",
  description: "Gourmet pizzas"
})

const pasta = await createEstablishment({
  name: "Pasta Heaven",
  slug: "pasta-heaven",
  description: "Traditional pasta dishes"
})
```

### Manage Separately
```typescript
// Pizza Palace menu
await createMenu({
  establishmentId: pizzeria.id,
  name: "Pizzas"
})

// Pasta Heaven menu
await createMenu({
  establishmentId: pasta.id,
  name: "Pasta Dishes"
})
```

Each has:
- Separate QR code
- Independent menu
- Own notification settings
- Separate order dashboard
- Unique Telegram alerts

---

## Example 5: Telegram Bot Integration

### Telegram Webhook Endpoint
```typescript
// app/api/webhooks/telegram/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  
  // Extract order details
  const { 
    establishmentId, 
    orderId, 
    customerName, 
    itemCount, 
    totalAmount 
  } = body

  // Format message
  const message = `
🔔 New Order Received!

Order ID: ${orderId.slice(0, 8)}
Customer: ${customerName}
Items: ${itemCount}
Total: $${totalAmount.toFixed(2)}

View: https://yoursite.com/dashboard/...
  `

  // Send via Telegram Bot API
  await axios.post(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    }
  )

  return Response.json({ success: true })
}
```

---

## Example 6: Error Handling

### What if user isn't authenticated?
```typescript
// getUserId() throws error
try {
  const items = await getMenuItems("menu_001...")
} catch (error) {
  // Error: "Unauthorized"
}
```

### What if establishment doesn't exist?
```typescript
try {
  await getEstablishment("invalid_id")
} catch (error) {
  // Error: "Establishment not found or unauthorized"
}
```

### What if creating order with missing items?
```typescript
try {
  await createOrder({
    establishmentId: "abc...",
    customerName: "John",
    customerEmail: "john@example.com",
    items: [
      { menuItemId: "invalid", quantity: 1 }
    ]
  })
} catch (error) {
  // Error: "Menu item not found"
}
```

---

## Example 7: Data Flow Diagram

```
OWNER JOURNEY:
┌─────────────┐
│   Sign Up   │──→ Create Account
└──────┬──────┘
       │
┌──────▼──────────────┐
│ Create Establishment│──→ Auto-Generate QR Code
└──────┬──────────────┘
       │
┌──────▼──────┐
│ Create Menu │──→ Organize offerings
└──────┬──────┘
       │
┌──────▼────────────────┐
│ Add Menu Items        │──→ Set prices, descriptions
└──────┬────────────────┘
       │
┌──────▼────────────────┐
│ Configure Telegram    │──→ Setup notifications
└──────┬────────────────┘
       │
       └─────────────────────→ Share QR Code


CUSTOMER JOURNEY:
┌─────────────────┐
│  Scan QR Code   │
└────────┬────────┘
         │
┌────────▼──────────┐
│ View Menu Page    │
└────────┬──────────┘
         │
┌────────▼──────────┐
│ Select Items      │
└────────┬──────────┘
         │
┌────────▼──────────┐
│ Add to Cart       │
└────────┬──────────┘
         │
┌────────▼──────────┐
│ Checkout          │
└────────┬──────────┘
         │
┌────────▼──────────┐
│ Submit Order      │
└────────┬──────────┘
         │
         ├─→ Order created
         ├─→ Confirmation shown
         └─→ Telegram alert sent


ORDER MANAGEMENT:
┌──────────────┐
│ Order Placed │
└────────┬─────┘
         │
    ┌────▼─────┐
    │ Telegram │────→ Owner notified
    └────┬─────┘
         │
┌────────▼──────────────┐
│ View Dashboard        │
└────────┬──────────────┘
         │
┌────────▼──────────────┐
│ Update Status         │
│ pending → confirmed   │
│ → preparing → ready   │
└────────┬──────────────┘
         │
┌────────▼──────────────┐
│ Order Completed       │
└───────────────────────┘
```

---

## Example 8: Database Queries

### Get all items for a menu
```sql
SELECT * FROM menu_items 
WHERE menu_id = $1 
AND is_available = true
ORDER BY created_at DESC
```

### Get orders for today
```sql
SELECT * FROM orders 
WHERE establishment_id = $1 
AND DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC
```

### Get total revenue
```sql
SELECT SUM(total_amount) as revenue
FROM orders 
WHERE establishment_id = $1 
AND status = 'completed'
AND created_at >= NOW() - INTERVAL '30 days'
```

---

## Summary

The Digital Menu SaaS provides:
- ✅ Complete user flow (signup to orders)
- ✅ Real-time notifications
- ✅ Multi-establishment support
- ✅ Flexible menu structure
- ✅ Secure data isolation
- ✅ Error handling

Ready for production use and easy to extend!
