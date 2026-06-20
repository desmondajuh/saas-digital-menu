'use client'

import { useEffect, useState } from 'react'
import { getEstablishment, updateEstablishment } from '@/app/actions/establishments'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SettingsPage({ params }: { params: { id: string } }) {
  const [establishment, setEstablishment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    telegramChatId: '',
    telegramBotToken: '',
    whatsappPhoneNumber: '',
    pushNotificationEnabled: true,
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadEstablishment()
  }, [params.id])

  async function loadEstablishment() {
    try {
      const data = await getEstablishment(params.id)
      setEstablishment(data)
      setFormData({
        name: data.name,
        description: data.description || '',
        telegramChatId: data.telegramChatId || '',
        telegramBotToken: data.telegramBotToken || '',
        whatsappPhoneNumber: data.whatsappPhoneNumber || '',
        pushNotificationEnabled: data.pushNotificationEnabled ?? true,
      })
    } catch (error) {
      console.error('Failed to load establishment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await updateEstablishment(params.id, {
        name: formData.name,
        description: formData.description,
        telegramChatId: formData.telegramChatId,
        telegramBotToken: formData.telegramBotToken,
        whatsappPhoneNumber: formData.whatsappPhoneNumber,
        pushNotificationEnabled: formData.pushNotificationEnabled,
      })
      setMessage('Settings saved successfully!')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  if (!establishment) {
    return <div className="text-center py-12">Establishment not found</div>
  }

  return (
    <div className="max-w-2xl">
      <Link href={`/dashboard/establishments/${params.id}`}>
        <Button variant="outline" size="sm">
          ← Back
        </Button>
      </Link>

      <h1 className="text-3xl font-bold text-foreground mt-6 mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Business Information</h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
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
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Notifications</h2>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pushNotificationEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pushNotificationEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-foreground">
                Enable Push Notifications
              </span>
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Receive browser notifications when customers place orders
            </p>
          </div>
        </div>

        {/* Telegram */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Telegram Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Get instant Telegram alerts when customers place orders
          </p>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Telegram Bot Token
            </label>
            <input
              type="password"
              value={formData.telegramBotToken}
              onChange={(e) =>
                setFormData({ ...formData, telegramBotToken: e.target.value })
              }
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get token from @BotFather on Telegram
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={formData.telegramChatId}
              onChange={(e) =>
                setFormData({ ...formData, telegramChatId: e.target.value })
              }
              placeholder="123456789"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get your chat ID from @userinfobot on Telegram
            </p>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">WhatsApp Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Get WhatsApp alerts (coming soon)
          </p>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              WhatsApp Phone Number
            </label>
            <input
              type="tel"
              value={formData.whatsappPhoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, whatsappPhoneNumber: e.target.value })
              }
              placeholder="+1234567890"
              disabled
              className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground placeholder-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              WhatsApp integration coming soon
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.includes('success')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <Link href={`/dashboard/establishments/${params.id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button disabled={saving} type="submit">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
