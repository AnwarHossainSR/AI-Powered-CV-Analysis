import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatabasePlansTab } from "@/components/admin/database-plans-tab"
import { StripePlansTab } from "@/components/admin/stripe-plans-tab"

export default function BillingManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing Management</h1>
        <p className="text-gray-600 mt-2">
          Manage Stripe products and database billing plans with automatic synchronization
        </p>
      </div>

      <Tabs defaultValue="database" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="database">Database Plans</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Products</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="mt-6">
          <DatabasePlansTab />
        </TabsContent>

        <TabsContent value="stripe" className="mt-6">
          <StripePlansTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
