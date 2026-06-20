# Digital Menu SaaS - Setup Guide

This guide will help you get the Digital Menu SaaS application fully set up and running.

## Quick Start (5 minutes)

### 1. Deploy to Vercel

Click the button below to deploy:

```
https://vercel.com/new/clone?repository-url=https://github.com/your-username/digital-menu-saas
```

Or manually:
1. Push code to GitHub
2. Go to vercel.com
3. Import the repository
4. Add environment variables (see below)
5. Deploy

### 2. Set Up Environment Variables

In your Vercel project settings, add:

```env
DATABASE_URL=<from-neon-integration>
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

### 3. You're Live!

Visit your deployment URL and sign up.

---

## Detailed Setup

### A. Neon PostgreSQL Integration

1. **In Vercel:**
   - Go to project Settings → Integrations
   - Click "Add Integration"
   - Search for "Neon"
   - Connect your Neon account
   - Create a new database or select existing
   - Vercel automatically adds `DATABASE_URL`

2. **Verify Connection:**
   - Check Environment Variables are set
   - Deployment should auto-create database tables

### B. Authentication Secret

1. **Generate Secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **Add to Vercel:**
   - Settings → Environment Variables
   - Key: `BETTER_AUTH_SECRET`
   - Value: Your generated secret
   - Redeploy

3. **Test:**
   - Visit `/sign-up`
   - Create an account
   - Should redirect to dashboard

### C. Telegram Bot Setup (Optional but Recommended)

Telegram notifications allow restaurant owners to receive instant alerts when customers place orders.

#### Step 1: Create Bot with @BotFather

1. Open Telegram
2. Search for `@BotFather` (official Telegram bot)
3. Click "Start" or send `/start`
4. Send `/newbot`
5. Enter bot name: "My Restaurant Orders"
6. Enter bot username: "my_restaurant_orders_bot" (must be unique)
7. Copy the token provided (something like `123456:ABC-DEF1234...`)

#### Step 2: Get Your Chat ID

1. Open Telegram
2. Search for `@userinfobot`
3. Click "Start"
4. It will show your Chat ID (a number like `123456789`)

#### Step 3: Add to Digital Menu App

1. Log in to Digital Menu dashboard
2. Click on an establishment
3. Go to Settings
4. Under "Telegram Notifications":
   - Paste the Bot Token
   - Paste your Chat ID
5. Click "Save Settings"

#### Step 4: Test

1. Go to the public menu page
2. Place a test order
3. Should receive Telegram message in your chat

#### Telegram Message Format

When a customer places an order, you'll receive:

```
🔔 New Order Received!
Order ID: abc12345
Customer: John Doe
Items: 3
Total: $45.99
[View Order button]
```

---

## Menu Setup

### 1. Create Establishment

1. Dashboard → Click "Create New"
2. Enter:
   - Business Name
   - URL Slug (lowercase, no spaces: "my-restaurant")
   - Description (optional)
3. Click "Create"
4. QR code is auto-generated!

### 2. Access Your Menu

Your menu will be available at:
- **Path-based**: `https://yoursite.com/my-restaurant/menu`
- **QR Code**: Points to `https://yoursite.com/restaurants/my-restaurant`
- **Subdomain** (if configured): `https://my-restaurant.yoursite.com/menu`

### 3. Create Menu

1. Click on establishment
2. Click "Create Menu"
3. Enter menu name: "Main Menu", "Appetizers", etc.
4. Add description (optional)
5. Click "Create Menu"

### 4. Add Menu Items

1. Click on menu
2. Click "Add Item"
3. Enter:
   - Item Name
   - Price
   - Category (optional)
   - Description
4. Click "Add Item"

### 5. Share QR Code

1. Go to establishment
2. Download or screenshot QR code
3. Print or display in your business
4. Customers scan to order

---

## Customization

### Change Domain

To use your custom domain:

1. Add domain to Vercel project
2. Update `BETTER_AUTH_URL` environment variable:
   ```
   BETTER_AUTH_URL=https://yourdomain.com
   ```
3. Redeploy

### Subdomain Support (Advanced)

To support `{slug}.yourdomain.com`:

1. Add wildcard DNS: `*.yourdomain.com` → Vercel
2. Update environment variable:
   ```
   BETTER_AUTH_URL=https://yourdomain.com
   ```
3. Subdomain routing is partially implemented

---

## Order Management

### View Orders

1. Dashboard
2. Click establishment
3. Click "View Orders"
4. See all incoming customer orders

### Filter Orders

Filter by status:
- Pending (new orders)
- Confirmed
- Preparing
- Ready
- Completed
- Cancelled

### Update Order Status

1. Click order
2. Click desired status button
3. Status updates immediately
4. Can still change status later

---

## Troubleshooting

### "Can't create account"
- Check BETTER_AUTH_SECRET is set
- Verify DATABASE_URL is valid
- Check Vercel logs for database errors

### "QR code not showing"
- Ensure establishment is created first
- Refresh page
- Check browser console for errors

### "Can't place orders"
- Verify menu items exist
- Check establishment slug is correct
- Confirm menu items have prices

### "Telegram not receiving messages"
- Verify bot token is correct (starts with numbers:)
- Verify chat ID is numeric and correct
- Check bot is running (send it a message on Telegram)
- Review application logs

### "Menu page is blank"
- Confirm establishment slug matches URL
- Ensure menus and items are created
- Check browser console for JavaScript errors
- Try different browser

---

## Performance Tips

1. **Optimize Images**
   - Keep menu item images under 500KB
   - Use web-friendly formats (JPG, WebP)

2. **Menu Organization**
   - Group items into logical menus
   - Use categories for filtering

3. **Database**
   - Remove old test establishments
   - Archive completed orders regularly

---

## Security Notes

- All data is encrypted in transit (HTTPS)
- Passwords use industry-standard hashing
- Database URLs are kept private
- Each user can only see their own data
- QR codes are shareable but establishments need slug

---

## API Endpoints

### Public
- `GET /{slug}/menu` - View menu
- `GET /restaurants/{slug}` - QR redirect

### Protected (Auth required)
- `GET /api/auth/session` - Get session
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up

### Webhooks
- `POST /api/webhooks/telegram` - Telegram notifications

---

## Getting Help

### Common Questions

**Q: Can I have multiple locations?**
A: Yes! Create multiple establishments, each with its own menu.

**Q: Do customers need accounts?**
A: No, customers just scan QR code and order with email/phone.

**Q: How do I accept payments?**
A: Currently takes orders only. Payments handled separately or at checkout.

**Q: Can I edit orders after placing?**
A: Currently no, but you can track status in dashboard.

### Resources

- Database: https://neon.tech/docs
- Auth: https://www.better-auth.com/docs
- Deployment: https://vercel.com/docs
- Telegram API: https://core.telegram.org/bots

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set up authentication
3. ✅ Create first establishment
4. ✅ Add sample menu items
5. ✅ Configure Telegram (optional)
6. ✅ Share QR code
7. 🚀 Go live!

---

## Support

For issues:
1. Check Vercel logs
2. Review browser console
3. Verify all environment variables
4. Contact support

Happy serving! 🍽️
