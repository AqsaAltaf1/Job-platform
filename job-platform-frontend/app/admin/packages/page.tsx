'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react'
import { getApiUrl } from '@/lib/config'
import { showToast } from '@/lib/toast'

interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string
  billing_cycle: 'monthly' | 'yearly' | 'one_time'
  price: number
  features: string[] | Record<string, any>
  max_job_postings: number
  max_applications: number
  max_team_members: number
  is_active: boolean
  stripe_price_id?: string
  stripe_product_id?: string
  created_at: string
  updated_at: string
}

export default function PackageManagementPage() {
  const [packages, setPackages] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    billing_cycle: 'monthly', // monthly, yearly, or one_time
    price: 0,
    features: [''],
    max_job_postings: 0,
    max_applications: 0,
    max_team_members: 0,
    is_active: true
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwt_token')
      const response = await fetch(getApiUrl('/admin/subscription-plans'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPackages(data.plans)
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      showToast.error('Failed to load subscription packages')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePackage = async () => {
    try {
      const token = localStorage.getItem('jwt_token')
      
      if (!token) {
        showToast.error('No authentication token found. Please login again.')
        return
      }
      
      const response = await fetch(getApiUrl('/admin/subscription-plans'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          showToast.success('Package created successfully!')
          setShowCreateForm(false)
          resetForm()
          fetchPackages()
        } else {
          showToast.error(data.error || 'Failed to create package')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Server error:', errorData)
        showToast.error(errorData.error || `Failed to create package (${response.status})`)
      }
    } catch (error) {
      console.error('Error creating package:', error)
      showToast.error('Failed to create package')
    }
  }



  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      billing_cycle: 'monthly',
      price: 0,
      features: [''],
      max_job_postings: 0,
      max_applications: 0,
      max_team_members: 0,
      is_active: true
    })
  }


  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }))
  }

  return (
    <AuthGuard allowedRoles={['super_admin']}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Package Management</h1>
              <p className="text-gray-600">
                Create and manage subscription packages for your platform
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchPackages} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Package
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
                  <p className="text-sm font-medium text-gray-600">Total Packages</p>
                  <p className="text-2xl font-bold text-primary">{packages.length}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Packages</p>
                  <p className="text-2xl font-bold text-green-600">
                    {packages.filter(p => p.is_active).length}
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
                  <p className="text-sm font-medium text-gray-600">Inactive Packages</p>
                  <p className="text-2xl font-bold text-red-600">
                    {packages.filter(p => !p.is_active).length}
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
                  <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${packages.length > 0 ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length) : 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="packages" className="w-full">
          <TabsList>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="create">Create Package</TabsTrigger>
          </TabsList>

          {/* Packages List */}
          <TabsContent value="packages" className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {pkg.name}
                            <Badge variant={pkg.is_active ? "default" : "secondary"}>
                              {pkg.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{pkg.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Pricing */}
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 capitalize">{pkg.billing_cycle}</p>
                            <p className="text-lg font-bold">${pkg.price}/{pkg.billing_cycle === 'monthly' ? 'mo' : pkg.billing_cycle === 'yearly' ? 'yr' : 'one-time'}</p>
                          </div>
                        </div>

                        {/* Limits */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Job Postings</p>
                            <p className="text-gray-600">{pkg.max_job_postings}</p>
                          </div>
                          <div>
                            <p className="font-medium">Applications</p>
                            <p className="text-gray-600">{pkg.max_applications}</p>
                          </div>
                          <div>
                            <p className="font-medium">Team Members</p>
                            <p className="text-gray-600">{pkg.max_team_members}</p>
                          </div>
                        </div>

                        {/* Features */}
                        <div>
                          <p className="font-medium text-sm mb-2">Features</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {(Array.isArray(pkg.features) ? pkg.features : Object.values(pkg.features || {})).map((feature, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {packages.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No packages found</p>
                    <p className="text-sm text-gray-400">Create your first subscription package</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Create/Edit Package Form */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Create New Package
                </CardTitle>
                <CardDescription>
                  Set up a new subscription package (monthly or yearly)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Package Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., professional-plan"
                      />
                    </div>

                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="e.g., Professional Plan"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this package includes"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="billing_cycle">Billing Cycle</Label>
                      <select
                        id="billing_cycle"
                        value={formData.billing_cycle}
                        onChange={(e) => setFormData(prev => ({ ...prev, billing_cycle: e.target.value as 'monthly' | 'yearly' | 'one_time' }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="one_time">One Time</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder={formData.billing_cycle === 'monthly' ? '29' : formData.billing_cycle === 'yearly' ? '299' : '99'}
                      />
                    </div>

                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="max_job_postings">Max Job Postings</Label>
                      <Input
                        id="max_job_postings"
                        type="number"
                        value={formData.max_job_postings}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_job_postings: Number(e.target.value) }))}
                        placeholder="10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="max_applications">Max Applications</Label>
                      <Input
                        id="max_applications"
                        type="number"
                        value={formData.max_applications}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_applications: Number(e.target.value) }))}
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="max_team_members">Max Team Members</Label>
                      <Input
                        id="max_team_members"
                        type="number"
                        value={formData.max_team_members}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_team_members: Number(e.target.value) }))}
                        placeholder="5"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active">Active Package</Label>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <Label>Features</Label>
                  <div className="space-y-2 mt-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="e.g., Advanced analytics"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                          disabled={formData.features.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={handleCreatePackage}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Package
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Reset Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
