import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import { CreditCard, Search, TrendingDown, TrendingUp } from "lucide-react"

export default async function AdminTransactionsPage() {
  const supabase = await createClient()

  // Get user (middleware ensures user exists and has admin access)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get all transactions with user info
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select(
      `
      *,
      profiles(full_name, email)
    `,
    )
    .order("created_at", { ascending: false })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "usage":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <CreditCard className="h-4 w-4 text-blue-500" />
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge className="bg-green-100 text-green-800">Purchase</Badge>
      case "usage":
        return <Badge className="bg-red-100 text-red-800">Usage</Badge>
      case "refund":
        return <Badge className="bg-yellow-100 text-yellow-800">Refund</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800">Bonus</Badge>
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
        <p className="mt-1 text-sm text-gray-600">Monitor credit transactions and revenue.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                All Transactions ({transactions?.length || 0})
              </CardTitle>
              <CardDescription>Complete transaction history</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search transactions..." className="pl-10 w-64" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction: any) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.description || `${transaction.type} transaction`}
                            </div>
                            <div className="text-sm text-gray-500">ID: {transaction.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.profiles?.full_name || "No name"}
                          </div>
                          <div className="text-sm text-gray-500">{transaction.profiles?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getTransactionBadge(transaction.type)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${
                            transaction.type === "purchase" || transaction.type === "bonus"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "purchase" || transaction.type === "bonus" ? "+" : "-"}
                          {Math.abs(transaction.amount)} credits
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">No transactions have been recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
