# Digital Menu SaaS

A comprehensive SaaS application for restaurants, bars, and hotels to create beautiful digital menus, manage items, generate QR codes, and receive customer orders with Telegram notifications.

## Features

### For Restaurant Owners

1. **User Authentication**
   - Email and password registration
   - Secure login/logout
   - Session management

2. **Establishment Management**
   - Create and manage multiple establishments
   - Auto-generated QR codes for each establishment
   - Regenerate QR codes as needed
   - Customizable establishment details (name, description, image)

3. **Menu Management**
   - Create multiple menus per establishment
   - Add menu items with:
     - Name, description, and price
     - Category
     - Item image (optional)
     - Availability status
   - Edit and delete menus and items

4. **Order Management**
   - Real-time order dashboard
   - View all incoming orders with customer details
   - Update order status (pending, confirmed, preparing, ready, completed, cancelled)
   - Filter orders by status
   - Order history and analytics

5. **Notifications**
   - Push notifications in browser
   - Telegram bot integration for order alerts
   - WhatsApp integration ready (partially implemented)

### For Customers

1. **Menu Browsing**
   - Access menu via QR code scan (redirects to URL)
   - Browse items organized by menu/category
   - View item details (description, price)
   - Filter by availability

2. **Ordering**
   - Add items to cart
   - Adjust quantities
   - View order summary with total
   - Provide contact information (name, email, phone)
   - Special requests/notes field
   - Submit order

3. **Responsive Design**
   - Mobile-friendly interface
   - Desktop optimized views
   - Touch-friendly controls

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth (email + password)
- **QR Code Generation**: qrcode library
- **Notifications**: 
  - Web Push API (browser notifications)
  - Telegram Bot API
- **Additional**: nanoid for ID generation, axios for HTTP requests

## Installation & Setup

### Prerequisites

- Node.js 18+ with pnpm
- Neon PostgreSQL database (connected via integration)
- BETTER_AUTH_SECRET environment variable

### 1. Environment Variables

Add these to your project environment (Settings → Vars):

```env
# Auto-provisioned by Neon integration
DATABASE_URL=postgres://...

# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your_secret_here

# Optional: for custom domain
BETTER_AUTH_URL=https://yourdomain.com

# Optional: for Telegram notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 2. Database Setup

The database schema is automatically created via Neon MCP. Tables include:

- `user` - Better Auth user table
- `session` - Better Auth session table
- `account` - Better Auth account table
- `verification` - Better Auth verification table
- `establishments` - Restaurant/bar/hotel businesses
- `menus` - Menu collections
- `menu_items` - Individual menu items
- `orders` - Customer orders
- `order_items` - Items in orders

### 3. Installation

```bash
# Install dependencies
pnpm install

# Add shadcn components if needed
pnpm exec shadcn add card input label button

# Start dev server
pnpm dev
```

The app will be available at `http://localhost:3000`

## Usage

### Owner Workflow

1. **Sign Up** - Create account at `/sign-up`
2. **Create Establishment** - Add your business
3. **Generate QR Code** - Share with customers
4. **Create Menus** - Organize your offerings
5. **Add Menu Items** - Set prices and descriptions
6. **Configure Notifications** - Set up Telegram alerts
7. **View Orders** - Manage incoming customer orders

### Customer Workflow

1. **Scan QR Code** - Points to `localhost:3000/restaurants/{slug}`
2. **Redirect to Menu** - Automatically navigates to `/{slug}/menu`
3. **Browse Items** - View all available items
4. **Add to Order** - Select items and quantities
5. **Checkout** - Provide contact info and submit
6. **Confirmation** - Order received message

## API Routes

### Authentication
- `GET/POST /api/auth/[...all]` - Better Auth handler

### Webhooks
- `POST /api/webhooks/telegram` - Telegram notification handler

### Public Routes
- `GET /{slug}/menu` - Public menu page
- `GET /restaurants/{slug}` - QR code redirect

## Server Actions

All data operations use server actions with per-user scoping (no Row-Level Security needed):

### Establishments
- `createEstablishment()` - Create new business
- `getEstablishments()` - List user's businesses
- `getEstablishment(id)` - Get single establishment
- `updateEstablishment()` - Update details
- `deleteEstablishment()` - Delete business
- `generateNewQRCode()` - Regenerate QR code

### Menus
- `createMenu()` - Create menu
- `getMenus()` - List menus for establishment
- `updateMenu()` - Update menu details
- `deleteMenu()` - Delete menu
- `createMenuItem()` - Add menu item
- `getMenuItems()` - List items in menu
- `updateMenuItem()` - Update item
- `deleteMenuItem()` - Remove item
- `getPublicMenu()` - Get menu for customers

### Orders
- `createOrder()` - Place customer order
- `getEstablishmentOrders()` - List orders for restaurant
- `getOrder()` - Get single order details
- `updateOrderStatus()` - Update order status

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables (DATABASE_URL, BETTER_AUTH_SECRET)
4. Deploy

### Custom Domain (Subdomain Routing)

To support both `/{slug}/menu` and `{slug}.domain.com`:

1. Configure wildcard DNS: `*.yourdomain.com` → Your Vercel deployment
2. Update `BETTER_AUTH_URL` environment variable
3. Add custom domain middleware (partially implemented)

## Telegram Bot Setup

1. Create Telegram bot via @BotFather
2. Get bot token
3. Get your chat ID from @userinfobot
4. Store in establishment settings
5. Orders will be sent to your Telegram chat

## Future Enhancements

- [ ] WhatsApp notifications
- [ ] Email notifications
- [ ] Payment integration (Stripe)
- [ ] Analytics dashboard
- [ ] Inventory management
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Menu scheduling (open/close times)
- [ ] Reservation system
- [ ] Review/rating system

## Project Structure

```
app/
  ├── page.tsx                    # Landing page
  ├── sign-in/page.tsx            # Login
  ├── sign-up/page.tsx            # Registration
  ├── dashboard/                  # Owner dashboard
  │   ├── page.tsx                # Establishments list
  │   └── establishments/
  │       └── [id]/               # Establishment details
  ├── [slug]/menu/page.tsx         # Public menu view
  ├── restaurants/[slug]/page.tsx  # QR code redirect
  ├── api/
  │   ├── auth/[...all]/route.ts   # Auth handler
  │   └── webhooks/telegram/route.ts # Telegram webhook
  └── actions/
      ├── establishments.ts         # Business logic
      ├── menus.ts                  # Menu logic
      └── orders.ts                 # Order logic

lib/
  ├── auth.ts                       # Better Auth config
  ├── auth-client.ts                # Client auth
  └── db/
      ├── index.ts                  # Drizzle setup
      └── schema.ts                 # Database schema

components/
  ├── auth-form.tsx                 # Login/signup form
  ├── create-establishment-modal.tsx # New business modal
  └── ui/                            # shadcn components
```

## Security Considerations

- All queries scoped by `userId` (no RLS needed)
- Better Auth handles password hashing
- Environment variables for sensitive data
- CORS protection via authentication
- Input validation on forms
- Protected API routes

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is set correctly
- Check Neon connection limits
- Ensure BETTER_AUTH_SECRET is set

### QR Code Not Generating
- Verify `process.env.BETTER_AUTH_URL` is configured
- Check URL format and accessibility

### Orders Not Creating
- Verify menuItems exist in database
- Check total amount calculation
- Review browser console for errors

### Telegram Not Receiving
- Verify telegram credentials are stored
- Check Telegram bot token is valid
- Ensure chat ID is correct

## Support

For issues or feature requests, please check the project documentation or contact the development team.

## License

MIT
