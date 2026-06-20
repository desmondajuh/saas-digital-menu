'use client'

import { useState } from 'react'
import { createEstablishment } from '@/app/actions/establishments'
import { Button } from '@/components/ui/button'

interface CreateEstablishmentModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateEstablishmentModal({
  onClose,
  onSuccess,
}: CreateEstablishmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  })
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name || !formData.slug) {
        throw new Error('Name and slug are required')
      }

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        throw new Error('Slug can only contain lowercase letters, numbers, and hyphens')
      }

      await createEstablishment({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create establishment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Create Establishment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Business Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="My Restaurant"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="my-restaurant"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used for your menu URL: /{formData.slug}/menu
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your business..."
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
