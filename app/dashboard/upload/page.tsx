import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import FileUpload from "@/components/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UploadPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} credits={profile.credits} />

      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 font-heading">Upload Resume</h1>
              <p className="mt-1 text-sm text-gray-600">
                Upload your resume files for AI-powered analysis and data extraction.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="font-heading">Upload Guidelines</CardTitle>
                  <CardDescription>Follow these guidelines for the best analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Supported formats: PDF, DOC, DOCX, TXT</li>
                    <li>• Maximum file size: 10MB per file</li>
                    <li>• Each file costs 1 credit to analyze</li>
                    <li>• Clear, well-formatted resumes get better results</li>
                    <li>• Processing typically takes 10-30 seconds</li>
                  </ul>
                </CardContent>
              </Card>

              <FileUpload userId={user.id} credits={profile.credits} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
