import FileUpload from "@/components/file-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Clock, Shield, Upload, Zap } from "lucide-react";

export default async function UploadPage() {
  const supabase = await createClient();

  // Get user (middleware ensures user exists)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30">
      <main className="py-12">
        <div className="px-4 sm:px-6 lg:px-8 mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-100 text-cyan-800 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Analysis
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Elevate Your Career Journey
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your CV for instant analysis and unlock insights that will
              transform your professional story.
            </p>
          </div>

          {/* Upload Section */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-8">
                  <CardTitle className="text-xl font-heading text-gray-900">
                    Select File
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Drag and drop your resume or click to browse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    userId={user!.id}
                    credits={profile?.credits || 0}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Guidelines */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-white">
                <CardHeader>
                  <CardTitle className="font-heading text-cyan-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Upload Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Supported Formats
                      </p>
                      <p className="text-sm text-gray-600">
                        PDF, DOC, DOCX, TXT
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">File Size</p>
                      <p className="text-sm text-gray-600">
                        Maximum 10MB per file
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">Credit Cost</p>
                      <p className="text-sm text-gray-600">
                        1 credit per analysis
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                <CardHeader>
                  <CardTitle className="font-heading text-purple-900 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Processing Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Our AI typically processes resumes in 10-30 seconds. Clear,
                    well-formatted documents yield the best results.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100/50">
              <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-heading mb-3">
                Instant Upload
              </h3>
              <p className="text-sm text-gray-600">
                Drag, drop, and watch your resume transform into structured
                insights
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-heading mb-3">
                AI Analysis
              </h3>
              <p className="text-sm text-gray-600">
                Advanced algorithms extract and analyze every detail of your
                experience
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50">
              <div className="w-16 h-16 bg-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 font-heading mb-3">
                Secure Processing
              </h3>
              <p className="text-sm text-gray-600">
                Your data is encrypted and processed with enterprise-grade
                security
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
