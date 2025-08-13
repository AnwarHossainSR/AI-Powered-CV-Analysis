import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, Calendar, Clock, CheckCircle, AlertCircle, FileDown } from "lucide-react"
import Link from "next/link"
import type { Resume } from "@/lib/types"

export default async function ResumesPage() {
  const supabase = createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get all user's resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} credits={profile.credits} />

      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 font-heading">Resume History</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage all your uploaded resumes and their analysis results.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Resumes</p>
                      <p className="text-2xl font-bold text-gray-900">{resumes?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Analyzed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {resumes?.filter((r) => r.status === "completed").length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Processing</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {resumes?.filter((r) => r.status === "processing" || r.status === "pending").length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resume List */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">All Resumes</CardTitle>
                <CardDescription>Complete history of your uploaded resumes</CardDescription>
              </CardHeader>
              <CardContent>
                {resumes && resumes.length > 0 ? (
                  <div className="space-y-4">
                    {resumes.map((resume: Resume) => (
                      <div
                        key={resume.id}
                        className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center flex-1">
                          <div className="flex-shrink-0">
                            <FileText className="h-10 w-10 text-blue-600" />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center">
                              <h4 className="text-lg font-medium text-gray-900">{resume.filename}</h4>
                              <Badge className={`ml-3 ${getStatusColor(resume.status)}`}>{resume.status}</Badge>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              Uploaded {new Date(resume.created_at).toLocaleDateString()}
                              {resume.file_size && (
                                <>
                                  <span className="mx-2">•</span>
                                  <FileDown className="h-4 w-4 mr-1" />
                                  {(resume.file_size / 1024 / 1024).toFixed(2)} MB
                                </>
                              )}
                            </div>
                            {resume.confidence_score && (
                              <div className="mt-2">
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-2">Analysis Confidence:</span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${resume.confidence_score}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-600 ml-2">{resume.confidence_score}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(resume.status)}
                          {resume.status === "completed" && (
                            <>
                              <Link href={`/dashboard/resume/${resume.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Analysis
                                </Button>
                              </Link>
                              <Link href={`/dashboard/resume/${resume.id}/cover-letter`}>
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Cover Letter
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No resumes yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Get started by uploading your first resume for AI analysis.
                    </p>
                    <div className="mt-6">
                      <Link href="/dashboard/upload">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <FileText className="mr-2 h-4 w-4" />
                          Upload Resume
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
