'use client'

import { useState } from 'react'
import { createMenu } from '@/app/actions/menus'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewMenuPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name) {
        throw new Error('Menu name is required')
      }

      const menuId = await createMenu({
        establishmentId: params.id,
        name: formData.name,
        description: formData.description,
      })

      router.push(`/dashboard/establishments/${params.id}/menus/${menuId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create menu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href={`/dashboard/establishments/${params.id}`}>
        <Button variant="outline" size="sm">
          ← Back
        </Button>
      </Link>

      <div className="mt-8 bg-card border rounded-lg p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Create New Menu</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Menu Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Main Menu, Lunch Menu, Drinks"
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe this menu..."
              rows={4}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link href={`/dashboard/establishments/${params.id}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button disabled={loading} type="submit">
              {loading ? 'Creating...' : 'Create Menu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
