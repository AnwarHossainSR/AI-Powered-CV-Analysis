"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Ban, UserCheck, CreditCard, Shield } from "lucide-react"

interface UserActionsDropdownProps {
  user: any
  onEdit: (user: any) => void
  onBlock: (user: any) => void
  onUnblock: (user: any) => void
  onAssignPlan: (user: any) => void
  onMakeAdmin: (user: any) => void
}

export function UserActionsDropdown({
  user,
  onEdit,
  onBlock,
  onUnblock,
  onAssignPlan,
  onMakeAdmin,
}: UserActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAssignPlan(user)}>
          <CreditCard className="h-4 w-4 mr-2" />
          Assign Plan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.is_blocked ? (
          <DropdownMenuItem onClick={() => onUnblock(user)}>
            <UserCheck className="h-4 w-4 mr-2" />
            Unblock User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onBlock(user)} className="text-red-600">
            <Ban className="h-4 w-4 mr-2" />
            Block User
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onMakeAdmin(user)}>
          <Shield className="h-4 w-4 mr-2" />
          Make Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
