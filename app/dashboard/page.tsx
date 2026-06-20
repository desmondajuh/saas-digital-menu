'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getEstablishments } from '@/app/actions/establishments'
import CreateEstablishmentModal from '@/components/create-establishment-modal'

export default function DashboardPage() {
  const [establishments, setEstablishments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadEstablishments()
  }, [])

  async function loadEstablishments() {
    try {
      const data = await getEstablishments()
      setEstablishments(data)
    } catch (error) {
      console.error('Failed to load establishments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEstablishmentCreated = () => {
    setShowModal(false)
    loadEstablishments()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Establishments</h1>
        <Button onClick={() => setShowModal(true)}>Create New</Button>
      </div>

      {establishments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No establishments yet</p>
          <Button onClick={() => setShowModal(true)}>Create Your First Establishment</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {establishments.map((est) => (
            <Link key={est.id} href={`/dashboard/establishments/${est.id}`}>
              <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                {est.image && (
                  <img
                    src={est.image}
                    alt={est.name}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                )}
                <h2 className="text-xl font-semibold text-foreground mb-2">{est.name}</h2>
                {est.description && (
                  <p className="text-sm text-muted-foreground mb-4">{est.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Slug: {est.slug}</p>
                  <div className="flex gap-2">
                    <code className="text-xs bg-accent px-2 py-1 rounded">
                      /{est.slug}/menu
                    </code>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && <CreateEstablishmentModal onClose={() => setShowModal(false)} onSuccess={handleEstablishmentCreated} />}
    </div>
  )
}
