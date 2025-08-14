import DashboardNav from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateCoverLetter } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Download, FileText, RefreshCw } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface CoverLetterPageProps {
  params: {
    id: string;
  };
}

export default async function CoverLetterPage(props: CoverLetterPageProps) {
  const supabase = await createClient();
  const { id } = await props.params; // ✅ await the params

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  // Get resume
  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume) {
    notFound();
  }

  // Generate cover letter if not exists
  let coverLetter = resume.cover_letter;
  if (!coverLetter && resume.parsed_data && resume.status === "completed") {
    try {
      coverLetter = await generateCoverLetter(resume.parsed_data);
      // Save the generated cover letter
      await supabase
        .from("resumes")
        .update({ cover_letter: coverLetter })
        .eq("id", resume.id);
    } catch (error) {
      console.error("Failed to generate cover letter:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} credits={profile.credits} />

      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Link
                href={`/dashboard/resume/${resume.id}`}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Resume Analysis
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 font-heading">
                Cover Letter
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                AI-generated cover letter based on your resume:{" "}
                {resume.filename}
              </p>
            </div>

            <div className="space-y-8">
              {/* Cover Letter Content */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-heading">
                        Generated Cover Letter
                      </CardTitle>
                      <CardDescription>
                        Personalized cover letter based on your resume analysis
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {coverLetter ? (
                    <div className="space-y-4">
                      <Textarea
                        value={coverLetter}
                        readOnly
                        className="min-h-[500px] font-mono text-sm leading-relaxed"
                      />
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Word count: {coverLetter.split(" ").length}</span>
                        <span>Character count: {coverLetter.length}</span>
                      </div>
                    </div>
                  ) : resume.status !== "completed" ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-16 w-16 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Resume Analysis Required
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Your resume needs to be analyzed before we can generate
                        a cover letter.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-16 w-16 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Generating Cover Letter
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Please refresh the page in a moment to see your
                        generated cover letter.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">
                    Cover Letter Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Customization
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Tailor for specific job postings</li>
                        <li>• Research the company culture</li>
                        <li>• Match keywords from job description</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Best Practices
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Keep it concise (3-4 paragraphs)</li>
                        <li>• Show enthusiasm and personality</li>
                        <li>• Include specific achievements</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
