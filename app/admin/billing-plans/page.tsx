"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CreditCard, DollarSign, Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval_type: string;
  credits: number;
  features: string[];
  stripe_price_id: string;
  stripe_product_id: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export default function BillingPlansPage() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    plan: BillingPlan | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    plan: null,
    isDeleting: false,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/billing-plans");
      const data = await response.json();

      if (response.ok) {
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to fetch billing plans");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deleteDialog.plan) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(
        `/api/admin/billing-plans/${deleteDialog.plan.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Billing plan deleted successfully!");
        setPlans(plans.filter((p) => p.id !== deleteDialog.plan!.id));
        setDeleteDialog({ isOpen: false, plan: null, isDeleting: false });
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete plan");
      }
    } catch (error) {
      toast.error("Failed to delete plan");
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const getIntervalBadge = (interval: string) => {
    const colors = {
      one_time: "bg-blue-100 text-blue-800",
      monthly: "bg-green-100 text-green-800",
      yearly: "bg-purple-100 text-purple-800",
    };
    return (
      colors[interval as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Billing Plans
          </h1>
          <p className="text-gray-600">
            Manage subscription plans and credit packages
          </p>
        </div>
        <Link href="/admin/billing-plans/new">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Plans
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter((p) => p.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Plus className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Credit Packages
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter((p) => p.interval_type === "one_time").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-heading">
                  {plan.name}
                </CardTitle>
                <Badge className={getIntervalBadge(plan.interval_type)}>
                  {plan.interval_type.replace("_", " ")}
                </Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                {plan.interval_type !== "one_time" && (
                  <span className="text-gray-600 ml-1">
                    /{plan.interval_type}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Credits:</span>
                <span className="font-medium">
                  {plan.credits === -1
                    ? "Unlimited"
                    : plan.credits?.toLocaleString()}
                </span>
              </div>

              {plan.features && plan.features.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Features:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1 h-1 bg-blue-600 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-gray-500">
                        +{plan.features.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex space-x-2">
                  <Link href={`/admin/billing-plans/${plan.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() =>
                      setDeleteDialog({ isOpen: true, plan, isDeleting: false })
                    }
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, plan: null, isDeleting: false })
        }
        onConfirm={handleDeletePlan}
        title="Delete Billing Plan"
        description={`Are you sure you want to delete "${deleteDialog.plan?.name}"? This will also archive the associated Stripe product and price. This action cannot be undone.`}
        confirmText="Delete Plan"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteDialog.isDeleting}
      />
    </div>
  );
}
