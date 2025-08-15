"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Resume } from "@/lib/types"
import { AlertCircle, CheckCircle, Clock, FileText, Plus, Upload } from "lucide-react"
import Link from "next/link"
import { getUserProfile, getUserResumes } from "@/lib/queries"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardPage() {
  const { user } = useAuth() // Using auth context instead of supabase.auth.getUser()
  const [profile, setProfile] = useState<any>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        const [profileData, resumesData] = await Promise.all([getUserProfile(user.id), getUserResumes(user.id)])

        setProfile(profileData)
        setResumes(resumesData || [])
      } catch (error) {
        console.error("[v0] Dashboard data loading error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "processing":
        return "Processing"
      case "failed":
        return "Failed"
      default:
        return "Pending"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {profile?.full_name || user?.email}! Manage your resumes and view analysis results.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Resumes</dt>
                  <dd className="text-lg font-medium text-gray-900">{resumes?.length || 0}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {resumes?.filter((r: any) => r.status === "completed").length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Processing</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {resumes?.filter((r: any) => r.status === "processing" || r.status === "pending").length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{profile?.credits || 0}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Credits Left</dt>
                  <dd className="text-lg font-medium text-gray-900">{profile?.credits || 0}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/dashboard/upload">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Upload Resume</h3>
                    <p className="text-sm text-gray-600">Upload a new resume for AI analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/billing">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Buy Credits</h3>
                    <p className="text-sm text-gray-600">Purchase more credits for analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Resumes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Resumes</CardTitle>
          <CardDescription>Your recently uploaded resumes and their analysis status</CardDescription>
        </CardHeader>
        <CardContent>
          {resumes && resumes.length > 0 ? (
            <div className="space-y-4">
              {resumes.slice(0, 10).map((resume: Resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600 mr-4" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{resume.filename}</h4>
                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(resume.status)}
                    <span className="ml-2 text-sm text-gray-600">{getStatusText(resume.status)}</span>
                    {resume.status === "completed" && (
                      <Link href={`/dashboard/resume/${resume.id}`}>
                        <Button variant="outline" size="sm" className="ml-4 bg-transparent">
                          View Results
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading your first resume.</p>
              <div className="mt-6">
                <Link href="/dashboard/upload">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resume
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
