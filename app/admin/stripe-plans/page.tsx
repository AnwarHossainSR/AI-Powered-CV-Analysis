"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "sonner"
import { Plus, Trash2, DollarSign, Calendar } from "lucide-react"

interface StripePrice {
  id: string
  unit_amount: number
  currency: string
  recurring?: {
    interval: string
  }
  active: boolean
}

interface StripeProduct {
  id: string
  name: string
  description: string
  active: boolean
  metadata: Record<string, string>
  prices: StripePrice[]
}

export default function StripeManagementPage() {
  const [products, setProducts] = useState<StripeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    productId: string
    productName: string
  }>({ open: false, productId: "", productName: "" })

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "usd",
    interval_type: "one_time",
    credits: "",
  })

  useEffect(() => {
    fetchStripeProducts()
  }, [])

  const fetchStripeProducts = async () => {
    try {
      const response = await fetch("/api/admin/stripe-plans")
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
      } else {
        toast.error(data.error || "Failed to fetch Stripe products")
      }
    } catch (error) {
      toast.error("Failed to fetch Stripe products")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/stripe-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          credits: formData.credits ? Number.parseInt(formData.credits) : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Stripe product created successfully!")
        setShowCreateForm(false)
        setFormData({
          name: "",
          description: "",
          price: "",
          currency: "usd",
          interval_type: "one_time",
          credits: "",
        })
        fetchStripeProducts()
      } else {
        toast.error(data.error || "Failed to create product")
      }
    } catch (error) {
      toast.error("Failed to create product")
    }
  }

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(`/api/admin/stripe-plans/${deleteDialog.productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Stripe product archived successfully!")
        fetchStripeProducts()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to archive product")
      }
    } catch (error) {
      toast.error("Failed to archive product")
    } finally {
      setDeleteDialog({ open: false, productId: "", productName: "" })
    }
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stripe Plans Management</h1>
          <p className="text-gray-600 mt-2">Manage Stripe products and prices directly from your admin panel</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Stripe Product
        </Button>
      </div>

      {showCreateForm && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">Create New Stripe Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interval">Billing Interval</Label>
                  <Select
                    value={formData.interval_type}
                    onValueChange={(value) => setFormData({ ...formData, interval_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One Time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="credits">Credits (Optional)</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Create Product
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No Stripe products found</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="border-gray-200 hover:border-purple-300 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-900">{product.name}</CardTitle>
                    <p className="text-gray-600 mt-1">{product.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-gray-500">ID: {product.id}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          productId: product.id,
                          productName: product.name,
                        })
                      }
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Prices:</h4>
                  {product.prices.length === 0 ? (
                    <p className="text-gray-500 text-sm">No prices configured</p>
                  ) : (
                    <div className="grid gap-2">
                      {product.prices.map((price) => (
                        <div key={price.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium">{formatPrice(price.unit_amount, price.currency)}</span>
                            {price.recurring && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                per {price.recurring.interval}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={price.active ? "default" : "secondary"}>
                              {price.active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-gray-500">{price.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Archive Stripe Product"
        description={`Are you sure you want to archive "${deleteDialog.productName}"? This will deactivate the product and all its prices in Stripe.`}
        confirmText="Archive Product"
        onConfirm={handleDeleteProduct}
        variant="destructive"
      />
    </div>
  )
}
