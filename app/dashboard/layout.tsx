import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-foreground">
            Digital Menu
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <form
              action={async () => {
                'use server'
                await auth.api.signOut({ headers: await headers() })
                redirect('/sign-in')
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-card border-r min-h-[calc(100vh-65px)]">
          <div className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded-md text-foreground hover:bg-accent"
            >
              Establishments
            </Link>
            <Link
              href="/dashboard/settings"
              className="block px-4 py-2 rounded-md text-foreground hover:bg-accent"
            >
              Settings
            </Link>
          </div>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
