"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReusableModal } from "@/components/ui/reusable-modal"
import { toast } from "sonner"

interface PlanAssignmentModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
  onAssign: (updatedUser: any) => void
}

export function PlanAssignmentModal({ user, isOpen, onClose, onAssign }: PlanAssignmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState("")
  const [customCredits, setCustomCredits] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchPlans()
    }
  }, [isOpen])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/billing-plans")
      if (response.ok) {
        const data = await response.json()
        const plansArray = Array.isArray(data) ? data : data.plans || []
        setPlans(plansArray)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
      toast.error("Failed to fetch billing plans")
    }
  }

  const handleAssign = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}/assign-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          credits: customCredits ? Number.parseInt(customCredits) : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to assign plan")
      }

      const updatedUser = await response.json()
      onAssign(updatedUser)
      toast.success("Plan assigned successfully")
      onClose()
    } catch (error) {
      console.error("Error assigning plan:", error)
      toast.error(error instanceof Error ? error.message : "Failed to assign plan")
    } finally {
      setLoading(false)
    }
  }

  const selectedPlanData = plans.find((plan: any) => plan.id === selectedPlan)

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={handleAssign} disabled={loading} className="bg-black hover:bg-gray-800 text-white">
        {loading ? "Assigning..." : "Assign Plan"}
      </Button>
    </>
  )

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Plan to User"
      description={`Assign a billing plan to ${user?.full_name || user?.email}`}
      footer={footer}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="plan">Select Plan</Label>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan: any) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price} ({plan.credits} credits)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPlanData && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{selectedPlanData.name}</h4>
            <p className="text-sm text-gray-600">{selectedPlanData.description}</p>
            <p className="text-sm font-medium mt-1">Default Credits: {selectedPlanData.credits}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="credits">Custom Credits (Optional)</Label>
          <Input
            id="credits"
            type="number"
            value={customCredits}
            onChange={(e) => setCustomCredits(e.target.value)}
            placeholder={`Default: ${selectedPlanData?.credits || 0}`}
          />
        </div>
      </div>
    </ReusableModal>
  )
}
