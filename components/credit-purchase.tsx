"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus } from "lucide-react"
import { CREDIT_PACKAGES } from "@/lib/stripe"

interface CreditPurchaseProps {
  currentCredits: number
}

export default function CreditPurchase({ currentCredits }: CreditPurchaseProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "credits",
          packageId,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Failed to initiate purchase. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy Credits</CardTitle>
        <div className="text-sm text-gray-600">
          Current balance: <span className="font-semibold text-blue-600">{currentCredits} credits</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative border rounded-lg p-4 ${
                pkg.popular ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600">Most Popular</Badge>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{pkg.credits}</div>
                <div className="text-sm text-gray-600">Credits</div>
                <div className="mt-2 text-lg font-semibold text-gray-900">${pkg.price}</div>
                <div className="text-xs text-gray-500">${(pkg.price / pkg.credits).toFixed(3)} per credit</div>
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`mt-4 w-full ${
                    pkg.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-gray-800"
                  }`}
                >
                  {loading === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Buy Credits
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
