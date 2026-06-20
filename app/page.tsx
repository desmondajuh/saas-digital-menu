import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-foreground">
            Digital Menu for Your Business
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create a beautiful, interactive digital menu for your restaurant, bar, or hotel. Generate QR codes, manage items, and receive customer orders instantly.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/sign-up">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">📱 QR Codes</h3>
            <p className="text-muted-foreground">
              Auto-generated QR codes for each establishment that customers can scan
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">📋 Easy Management</h3>
            <p className="text-muted-foreground">
              Create menus, add items with prices and descriptions
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">🔔 Notifications</h3>
            <p className="text-muted-foreground">
              Get Telegram alerts when customers place orders
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
