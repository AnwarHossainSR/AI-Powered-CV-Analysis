"use client";

import { PlanAssignmentModal } from "@/components/admin/plan-assignment-modal";
import { UserActionsDropdown } from "@/components/admin/user-actions-dropdown";
import { UserEditModal } from "@/components/admin/user-edit-modal";
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
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Filter, RefreshCw, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any>([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, subscriptionFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        console.log("[v0] API response:", data); // Debug log to see the actual response structure
        setUsers(data.users || data); // Handle both structured and direct array responses
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user: any) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user: any) => {
        if (statusFilter === "blocked") return user.is_blocked;
        if (statusFilter === "active") return !user.is_blocked;
        return true;
      });
    }

    // Subscription filter
    if (subscriptionFilter !== "all") {
      filtered = filtered.filter(
        (user: any) => user.subscription_status === subscriptionFilter
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleAssignPlan = (user: any) => {
    setSelectedUser(user);
    setPlanModalOpen(true);
  };

  const handleBlock = (user: any) => {
    setSelectedUser(user);
    setActionType("block");
    setConfirmDialogOpen(true);
  };

  const handleUnblock = (user: any) => {
    setSelectedUser(user);
    setActionType("unblock");
    setConfirmDialogOpen(true);
  };

  const handleMakeAdmin = (user: any) => {
    setSelectedUser(user);
    setActionType("makeAdmin");
    setConfirmDialogOpen(true);
  };

  const executeAction = async () => {
    if (!selectedUser) return;

    try {
      let endpoint = "";
      const method = "PUT";
      let body = {};

      switch (actionType) {
        case "block":
          endpoint = `/api/admin/users/${selectedUser.id}`;
          body = { ...selectedUser, is_blocked: true };
          break;
        case "unblock":
          endpoint = `/api/admin/users/${selectedUser.id}`;
          body = { ...selectedUser, is_blocked: false };
          break;
        case "makeAdmin":
          // This would need a separate endpoint for admin role assignment
          toast.info("Admin role assignment feature coming soon");
          return;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(`User ${actionType}ed successfully`);
        fetchUsers(); // Refresh the list
      } else {
        toast.error(`Failed to ${actionType} user`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing user:`, error);
      toast.error(`Error ${actionType}ing user`);
    }
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUsers(
      users.map((user: any) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage user accounts, subscriptions, and permissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                All Users ({filteredUsers.length})
              </CardTitle>
              <CardDescription>
                Complete list of registered users with advanced filtering
              </CardDescription>
            </div>
            <Button
              onClick={fetchUsers}
              variant="outline"
              size="sm"
              className="bg-black hover:bg-gray-800 text-white"
            >
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
            <Select
              value={subscriptionFilter}
              onValueChange={setSubscriptionFilter}
            >
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

          {filteredUsers.length > 0 ? (
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
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || "No name"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={user.is_blocked ? "destructive" : "default"}
                        >
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.resumes?.[0]?.count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <UserActionsDropdown
                          user={user}
                          onEdit={handleEdit}
                          onBlock={handleBlock}
                          onUnblock={handleUnblock}
                          onAssignPlan={handleAssignPlan}
                          onMakeAdmin={handleMakeAdmin}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No users found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ||
                statusFilter !== "all" ||
                subscriptionFilter !== "all"
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
        title={`${
          actionType === "block"
            ? "Block"
            : actionType === "unblock"
            ? "Unblock"
            : "Make Admin"
        } User`}
        description={`Are you sure you want to ${actionType} ${
          selectedUser?.full_name || selectedUser?.email
        }?`}
        variant={actionType === "block" ? "destructive" : "default"}
      />
    </>
  );
}
