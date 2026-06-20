'use client'

import { useEffect, useState } from 'react'
import { getEstablishmentOrders, updateOrderStatus } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage({ params }: { params: { id: string } }) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  useEffect(() => {
    loadOrders()
    // Poll for new orders every 10 seconds
    const interval = setInterval(loadOrders, 10000)
    return () => clearInterval(interval)
  }, [params.id])

  async function loadOrders() {
    try {
      const data = await getEstablishmentOrders(params.id)
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    try {
      await updateOrderStatus(orderId, newStatus)
      loadOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('Failed to update order status')
    }
  }

  const filteredOrders = orders.filter((order) =>
    filter === 'all' ? true : order.status === filter
  )

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/establishments/${params.id}`}>
          <Button variant="outline" size="sm">
            ← Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mt-4">Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map(
          (status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status as OrderStatus | 'all')}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          )
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground">
            No orders {filter !== 'all' ? `with status "${filter}"` : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-card border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[order.status as OrderStatus]
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4 bg-accent/5 rounded p-3">
                <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                <ul className="space-y-1">
                  {order.items.map((item: any) => (
                    <li key={item.id} className="text-sm text-muted-foreground">
                      {item.quantity}x - ${parseFloat(item.price).toFixed(2)} each
                    </li>
                  ))}
                </ul>
              </div>

              {order.notes && (
                <div className="mb-4 bg-accent/5 rounded p-3">
                  <p className="text-sm font-medium text-foreground mb-1">Special Requests:</p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}

              {/* Status Buttons */}
              <div className="flex gap-2 flex-wrap">
                {(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as OrderStatus[]).map(
                  (status) => (
                    <Button
                      key={status}
                      variant={order.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange(order.id, status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
