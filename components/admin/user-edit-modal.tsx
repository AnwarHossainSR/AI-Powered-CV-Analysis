"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ReusableModal } from "@/components/ui/reusable-modal"
import { toast } from "sonner"

interface UserEditModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedUser: any) => void
}

export function UserEditModal({ user, isOpen, onClose, onUpdate }: UserEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    subscription_status: "free",
    credits: 0,
    is_blocked: false,
  })

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        full_name: user.full_name || "",
        subscription_status: user.subscription_status || "free",
        credits: user.credits || 0,
        is_blocked: user.is_blocked || false,
      })
    }
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update user")
      }

      const updatedUser = await response.json()
      onUpdate(updatedUser)
      toast.success("User updated successfully")
      onClose()
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading} className="bg-black hover:bg-gray-800 text-white" onClick={handleSubmit}>
        {loading ? "Updating..." : "Update User"}
      </Button>
    </>
  )

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      description="Update user information and settings."
      footer={footer}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscription_status">Subscription Status</Label>
          <Select
            value={formData.subscription_status}
            onValueChange={(value) => setFormData({ ...formData, subscription_status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="credits">Credits</Label>
          <Input
            id="credits"
            type="number"
            value={formData.credits}
            onChange={(e) => setFormData({ ...formData, credits: Number.parseInt(e.target.value) || 0 })}
            placeholder="Enter credits"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_blocked"
            checked={formData.is_blocked}
            onCheckedChange={(checked) => setFormData({ ...formData, is_blocked: checked })}
          />
          <Label htmlFor="is_blocked">Block User</Label>
        </div>
      </div>
    </ReusableModal>
  )
}
