"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserActionsDropdown } from "@/components/admin/user-actions-dropdown"
import { UserEditModal } from "@/components/admin/user-edit-modal"
import { PlanAssignmentModal } from "@/components/admin/plan-assignment-modal"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Search, Users, Filter, RefreshCw } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useAdminUsers, useUpdateUser } from "@/lib/hooks/use-query-hooks"
import { toast } from "react-toastify"

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subscriptionFilter, setSubscriptionFilter] = useState("all")

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionType, setActionType] = useState("")

  const filters = useMemo(
    () => ({
      search: searchTerm,
      status: statusFilter,
      subscription: subscriptionFilter,
    }),
    [searchTerm, statusFilter, subscriptionFilter],
  )

  const { data: usersData, isLoading, refetch } = useAdminUsers(filters)
  const updateUserMutation = useUpdateUser()

  const users = usersData?.users || []

  const executeAction = async () => {
    if (!selectedUser) return

    try {
      let updateData = {}

      switch (actionType) {
        case "block":
          updateData = { ...selectedUser, is_blocked: true }
          break
        case "unblock":
          updateData = { ...selectedUser, is_blocked: false }
          break
        case "makeAdmin":
          // This would need a separate endpoint for admin role assignment
          toast.info("Admin role assignment feature coming soon")
          return
      }

      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        data: updateData,
      })
    } catch (error) {
      console.error(`Error ${actionType}ing user:`, error)
    }
  }

  const handleUserUpdate = (updatedUser: any) => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-600">Manage user accounts, subscriptions, and permissions.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                All Users ({users.length})
              </CardTitle>
              <CardDescription>Complete list of registered users with advanced filtering</CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resumes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name || "No name"}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.is_blocked ? "destructive" : "default"}>
                          {user.is_blocked ? "Blocked" : "Active"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            user.subscription_status === "free"
                              ? "secondary"
                              : user.subscription_status === "premium"
                                ? "default"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {user.subscription_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.credits}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.resumes?.[0]?.count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <UserActionsDropdown
                          user={user}
                          onEdit={() => {
                            setSelectedUser(user)
                            setEditModalOpen(true)
                          }}
                          onBlock={() => {
                            setSelectedUser(user)
                            setActionType("block")
                            setConfirmDialogOpen(true)
                          }}
                          onUnblock={() => {
                            setSelectedUser(user)
                            setActionType("unblock")
                            setConfirmDialogOpen(true)
                          }}
                          onAssignPlan={() => {
                            setSelectedUser(user)
                            setPlanModalOpen(true)
                          }}
                          onMakeAdmin={() => {
                            setSelectedUser(user)
                            setActionType("makeAdmin")
                            setConfirmDialogOpen(true)
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all" || subscriptionFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No users have registered yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <>
          <UserEditModal
            user={selectedUser}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onUpdate={handleUserUpdate}
          />
          <PlanAssignmentModal
            user={selectedUser}
            isOpen={planModalOpen}
            onClose={() => setPlanModalOpen(false)}
            onAssign={handleUserUpdate}
          />
        </>
      )}

      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={executeAction}
        title={`${actionType === "block" ? "Block" : actionType === "unblock" ? "Unblock" : "Make Admin"} User`}
        description={`Are you sure you want to ${actionType} ${selectedUser?.full_name || selectedUser?.email}?`}
        variant={actionType === "block" ? "destructive" : "default"}
      />
    </>
  )
}
