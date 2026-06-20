'use client'

import { useEffect, useState } from 'react'
import { getEstablishment, generateNewQRCode } from '@/app/actions/establishments'
import { getMenus } from '@/app/actions/menus'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function EstablishmentPage({ params }: { params: { id: string } }) {
  const [establishment, setEstablishment] = useState<any>(null)
  const [menus, setMenus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      const [estData, menusData] = await Promise.all([
        getEstablishment(params.id),
        getMenus(params.id),
      ])
      setEstablishment(estData)
      setMenus(menusData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerateQR() {
    try {
      const newQR = await generateNewQRCode(params.id)
      setEstablishment({ ...establishment, qrCode: newQR })
    } catch (error) {
      console.error('Failed to regenerate QR code:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  if (!establishment) {
    return <div className="text-center py-12">Establishment not found</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">{establishment.name}</h1>
        {establishment.description && (
          <p className="text-muted-foreground mb-4">{establishment.description}</p>
        )}

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Menu URL</h3>
            <code className="bg-accent px-3 py-2 rounded text-sm block mb-2">
              /{establishment.slug}/menu
            </code>
            <p className="text-sm text-muted-foreground">
              Full URL: {process.env.NEXT_PUBLIC_DOMAIN || 'https://example.com'}/{establishment.slug}/menu
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">QR Code</h3>
            {establishment.qrCode && (
              <div>
                <Image
                  src={establishment.qrCode}
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="mb-3"
                />
                <Button variant="outline" size="sm" onClick={handleRegenerateQR}>
                  Regenerate QR Code
                </Button>
              </div>
            )}
          </div>

          <Link href={`/dashboard/establishments/${params.id}/settings`}>
            <Button variant="outline">Settings</Button>
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Menus</h2>
          <Link href={`/dashboard/establishments/${params.id}/menus/new`}>
            <Button>Create Menu</Button>
          </Link>
        </div>

        {menus.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground mb-4">No menus yet</p>
            <Link href={`/dashboard/establishments/${params.id}/menus/new`}>
              <Button>Create Your First Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menus.map((menu) => (
              <Link
                key={menu.id}
                href={`/dashboard/establishments/${params.id}/menus/${menu.id}`}
              >
                <div className="bg-card border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                  <h3 className="font-semibold text-foreground mb-1">{menu.name}</h3>
                  {menu.description && (
                    <p className="text-sm text-muted-foreground mb-3">{menu.description}</p>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      menu.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {menu.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Orders</h2>
        <Link href={`/dashboard/establishments/${params.id}/orders`}>
          <Button variant="outline">View Orders</Button>
        </Link>
      </div>
    </div>
  )
}
