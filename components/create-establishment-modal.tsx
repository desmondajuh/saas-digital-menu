'use client'

import { useState } from 'react'
import { createEstablishment } from '@/app/actions/establishments'

interface CreateEstablishmentModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateEstablishmentModal({
  onClose,
  onSuccess,
}: CreateEstablishmentModalProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    try {
      setError('')
      setLoading(true)
      
      const name = formData.get('name') as string
      const slug = formData.get('slug') as string
      const description = formData.get('description') as string

      if (!name || !slug) {
        setError('Name and slug are required')
        return
      }

      if (!/^[a-z0-9-]+$/.test(slug)) {
        setError('Slug can only contain lowercase letters, numbers, and hyphens')
        return
      }

      await createEstablishment({
        name,
        slug,
        description,
      })

      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create establishment'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Create Establishment</h2>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Business Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="My Restaurant"
              required
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
              placeholder="my-restaurant"
              required
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used for your menu URL: /slug/menu
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your business..."
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">{error}</div>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-input rounded-md bg-background text-foreground hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 disabled:opacity-50 font-medium"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
