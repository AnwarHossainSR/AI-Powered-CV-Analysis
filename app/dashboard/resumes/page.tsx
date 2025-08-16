import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser, getUserResumes } from "@/lib/queries";
import type { Resume } from "@/lib/types";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileDown,
  FileText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default async function ResumesPage() {
  const user = await getUser();
  const resumes = await getUserResumes(user!.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "processing":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30">
      <main className="py-12">
        <div className="px-4 sm:px-6 lg:px-8 mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-heading">
                  Your Resume Evolution
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Track your progress and improvements over time
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/30 rounded-full -mr-16 -mt-16"></div>
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-700 uppercase tracking-wide">
                      Total Resumes
                    </p>
                    <p className="text-4xl font-bold text-cyan-900 mt-2">
                      {resumes?.length || 0}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -mr-16 -mt-16"></div>
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700 uppercase tracking-wide">
                      Analyzed
                    </p>
                    <p className="text-4xl font-bold text-emerald-900 mt-2">
                      {resumes?.filter((r: Resume) => r.status === "completed")
                        .length || 0}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-amber-100/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16"></div>
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 uppercase tracking-wide">
                      Processing
                    </p>
                    <p className="text-4xl font-bold text-amber-900 mt-2">
                      {resumes?.filter(
                        (r: Resume) =>
                          r.status === "processing" || r.status === "pending"
                      ).length || 0}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resume List */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-heading text-gray-900 flex items-center">
                    <Sparkles className="w-6 h-6 mr-3 text-purple-600" />
                    All Resumes
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 mt-2">
                    Complete history of your uploaded resumes
                  </CardDescription>
                </div>
                <Link href="/dashboard/upload">
                  <Button className="bg-black hover:bg-gray-800 text-white shadow-lg">
                    <FileText className="mr-2 h-4 w-4" />
                    Upload New Resume
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {resumes && resumes.length > 0 ? (
                <div className="space-y-6">
                  {resumes.map((resume: Resume) => (
                    <div
                      key={resume.id}
                      className="group p-8 border border-gray-100 rounded-2xl hover:shadow-xl hover:border-cyan-200 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className="flex-shrink-0 mr-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <FileText className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <h4 className="text-lg font-semibold text-gray-900 font-heading">
                                {resume.filename}
                              </h4>
                              <Badge
                                className={`ml-4 px-3 py-1 border ${getStatusColor(
                                  resume.status
                                )}`}
                              >
                                {resume.status}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 space-x-6">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Uploaded{" "}
                                {new Date(
                                  resume.created_at
                                ).toLocaleDateString()}
                              </div>
                              {resume.file_size && (
                                <div className="flex items-center">
                                  <FileDown className="h-4 w-4 mr-2" />
                                  {(resume.file_size / 1024 / 1024).toFixed(
                                    2
                                  )}{" "}
                                  MB
                                </div>
                              )}
                            </div>
                            {resume.confidence_score && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Analysis Confidence
                                  </span>
                                  <span className="text-sm font-semibold text-cyan-600">
                                    {resume.confidence_score}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className="bg-gradient-to-r from-cyan-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${resume.confidence_score}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(resume.status)}
                          {resume.status === "completed" && (
                            <div className="flex space-x-3">
                              <Link href={`/dashboard/resume/${resume.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-cyan-50 hover:border-cyan-300 bg-transparent"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Analysis
                                </Button>
                              </Link>
                              <Link
                                href={`/dashboard/resume/${resume.id}/cover-letter`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-purple-50 hover:border-purple-300 bg-transparent"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Cover Letter
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 font-heading mb-4">
                    No resumes yet
                  </h3>
                  <p className="text-base text-gray-500 mb-8 max-w-md mx-auto">
                    Get started by uploading your first resume for AI analysis
                    and unlock professional insights.
                  </p>
                  <Link href="/dashboard/upload">
                    <Button className="bg-black hover:bg-gray-800 text-white shadow-lg px-8 py-3 text-lg">
                      <FileText className="mr-2 h-5 w-5" />
                      Upload Your First Resume
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
