'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Webhook, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Filter,
  Download
} from 'lucide-react'
import { getApiUrl } from '@/lib/config'

interface WebhookEvent {
  id: string
  stripe_event_id: string
  event_type: string
  processed: boolean
  processing_error?: string
  created_at: string
  processed_at?: string
  event_data?: any
}

export default function WebhookManagementPage() {
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null)
  const [filter, setFilter] = useState<'all' | 'processed' | 'failed' | 'pending'>('all')

  useEffect(() => {
    fetchWebhookEvents()
  }, [])

  const fetchWebhookEvents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/admin/webhook-events'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWebhookEvents(data.events)
        }
      }
    } catch (error) {
      console.error('Error fetching webhook events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = webhookEvents.filter(event => {
    switch (filter) {
      case 'processed':
        return event.processed && !event.processing_error
      case 'failed':
        return !event.processed || event.processing_error
      case 'pending':
        return !event.processed && !event.processing_error
      default:
        return true
    }
  })

  const getStatusBadge = (event: WebhookEvent) => {
    if (event.processing_error) {
      return <Badge variant="destructive">Failed</Badge>
    } else if (event.processed) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Processed</Badge>
    } else {
      return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('subscription')) {
      return <Webhook className="h-4 w-4" />
    } else if (eventType.includes('payment')) {
      return <Activity className="h-4 w-4" />
    } else if (eventType.includes('invoice')) {
      return <CheckCircle className="h-4 w-4" />
    } else {
      return <AlertTriangle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Webhook Management</h1>
              <p className="text-gray-600">
                Monitor and manage Stripe webhook events
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchWebhookEvents} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-primary">{webhookEvents.length}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Webhook className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {webhookEvents.filter(e => e.processed && !e.processing_error).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {webhookEvents.filter(e => !e.processed || e.processing_error).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {webhookEvents.filter(e => !e.processed && !e.processing_error).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Webhook Events</CardTitle>
                    <CardDescription>
                      Recent Stripe webhook events and their status
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === 'processed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('processed')}
                    >
                      Processed
                    </Button>
                    <Button
                      variant={filter === 'failed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('failed')}
                    >
                      Failed
                    </Button>
                    <Button
                      variant={filter === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('pending')}
                    >
                      Pending
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-center gap-3">
                          {getEventTypeIcon(event.event_type)}
                          <div>
                            <p className="font-medium text-sm">{event.event_type}</p>
                            <p className="text-xs text-gray-600">
                              {event.stripe_event_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(event)}
                          <p className="text-xs text-gray-600">
                            {formatDate(event.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {filteredEvents.length === 0 && (
                      <div className="text-center py-8">
                        <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No webhook events found</p>
                        <p className="text-sm text-gray-400">
                          {filter === 'all' 
                            ? 'Webhook events will appear here when Stripe sends them'
                            : `No ${filter} events found`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Event Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>
                  {selectedEvent ? 'Webhook event information' : 'Select an event to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEvent ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Event Type</p>
                      <p className="text-sm">{selectedEvent.event_type}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stripe Event ID</p>
                      <p className="text-sm font-mono">{selectedEvent.stripe_event_id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedEvent)}</div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Created</p>
                      <p className="text-sm">{formatDate(selectedEvent.created_at)}</p>
                    </div>
                    
                    {selectedEvent.processed_at && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Processed</p>
                        <p className="text-sm">{formatDate(selectedEvent.processed_at)}</p>
                      </div>
                    )}
                    
                    {selectedEvent.processing_error && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Error</p>
                        <p className="text-sm text-red-600">{selectedEvent.processing_error}</p>
                      </div>
                    )}
                    
                    {selectedEvent.event_data && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Event Data</p>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                          {JSON.stringify(selectedEvent.event_data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select an event to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
