"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  DollarSign,
  Plus,
  FolderSyncIcon as Sync,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CSVBulkUpload } from "./csv-bulk-upload";

interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring?: {
    interval: string;
  };
  active: boolean;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: Record<string, string>;
  prices: StripePrice[];
}

export function StripePlansTab() {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
  }>({ open: false, productId: "", productName: "" });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "usd",
    interval_type: "one_time",
    credits: "",
    features: "",
  });

  useEffect(() => {
    fetchStripeProducts();
  }, []);

  const fetchStripeProducts = async () => {
    try {
      const response = await fetch("/api/admin/stripe-plans");
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
      } else {
        toast.error(data.error || "Failed to fetch Stripe products");
      }
    } catch (error) {
      toast.error("Failed to fetch Stripe products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/stripe-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          credits: formData.credits ? Number.parseInt(formData.credits) : null,
          features: formData.features
            ? formData.features.split(",").map((f) => f.trim())
            : [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Stripe product created and synced to database!");
        setShowCreateForm(false);
        setFormData({
          name: "",
          description: "",
          price: "",
          currency: "usd",
          interval_type: "one_time",
          credits: "",
          features: "",
        });
        fetchStripeProducts();
      } else {
        toast.error(data.error || "Failed to create product");
      }
    } catch (error) {
      toast.error("Failed to create product");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(
        `/api/admin/stripe-plans/${deleteDialog.productId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Stripe product archived and removed from database!");
        fetchStripeProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to archive product");
      }
    } catch (error) {
      toast.error("Failed to archive product");
    } finally {
      setDeleteDialog({ open: false, productId: "", productName: "" });
    }
  };

  const handleSyncWithDatabase = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/admin/stripe-plans/sync", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Successfully synced Stripe products with database!");
        fetchStripeProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to sync with database");
      }
    } catch (error) {
      toast.error("Failed to sync with database");
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkUploadComplete = () => {
    fetchStripeProducts();
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Stripe Products</h2>
          <p className="text-gray-600 mt-1">
            Manage Stripe products with automatic database sync
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSyncWithDatabase}
            disabled={syncing}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
          >
            <Sync className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            Sync with DB
          </Button>
        </div>
      </div>

      {/* Tabs for different creation methods */}
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="single">Single Product</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </div>

          {showCreateForm && (
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-800">
                  Create New Stripe Product
                </CardTitle>
                <p className="text-sm text-gray-600">
                  This will create a Stripe product and automatically add it to
                  your database
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
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
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) =>
                          setFormData({ ...formData, currency: value })
                        }
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
                        onValueChange={(value) =>
                          setFormData({ ...formData, interval_type: value })
                        }
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
                      <Label htmlFor="credits">Credits</Label>
                      <Input
                        id="credits"
                        type="number"
                        value={formData.credits}
                        onChange={(e) =>
                          setFormData({ ...formData, credits: e.target.value })
                        }
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="features">Features (comma-separated)</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) =>
                        setFormData({ ...formData, features: e.target.value })
                      }
                      placeholder="AI Resume Analysis, Cover Letter Generation, Priority Support"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create & Sync
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <CSVBulkUpload onUploadComplete={handleBulkUploadComplete} />
        </TabsContent>
      </Tabs>

      <div className="grid gap-6">
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No Stripe products found</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card
              key={product.id}
              className="border-gray-200 hover:border-purple-300 transition-colors"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      {product.name}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">{product.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        ID: {product.id}
                      </span>
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
                    <p className="text-gray-500 text-sm">
                      No prices configured
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      {product.prices.map((price) => (
                        <div
                          key={price.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium">
                              {formatPrice(price.unit_amount, price.currency)}
                            </span>
                            {price.recurring && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                per {price.recurring.interval}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={price.active ? "default" : "secondary"}
                            >
                              {price.active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {price.id}
                            </span>
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
        isOpen={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, productId: "", productName: "" })
        }
        title="Archive Stripe Product"
        description={`Are you sure you want to archive "${deleteDialog.productName}"? This will deactivate the product in Stripe and remove it from your database.`}
        confirmText="Archive & Remove"
        onConfirm={handleDeleteProduct}
        variant="destructive"
      />
    </div>
  );
}
