import DashboardNav from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCoverLetter } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Briefcase,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CoverLetterPageProps {
  params: {
    id: string;
  };
}

export default async function CoverLetterPage(
  props: Promise<CoverLetterPageProps>
) {
  const supabase = await createClient();
  const { params } = await props;

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  // Get resume with parsed data
  const { data: resume } = await supabase
    .from("resumes")
    .select(
      `
      *,
      parsed_data (*)
    `
    )
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single();

  if (!resume) {
    notFound();
  }

  const generateEnhancedCoverLetter = async (
    parsedData: any,
    jobTitle?: string,
    companyName?: string,
    jobDescription?: string
  ) => {
    try {
      const prompt: any = `Generate a professional cover letter based on the following resume data and job information:

RESUME DATA:
${JSON.stringify(parsedData, null, 2)}

JOB DETAILS:
- Job Title: ${jobTitle || "Not specified"}
- Company Name: ${companyName || "Not specified"}
- Job Description: ${jobDescription || "Not provided"}

INSTRUCTIONS:
1. Create a compelling cover letter that highlights relevant experience from the resume
2. Match skills and experience to the job requirements
3. Show enthusiasm for the specific role and company
4. Keep it professional but personable
5. Structure: Opening paragraph, 2-3 body paragraphs, closing paragraph
6. Length: 3-4 paragraphs, approximately 250-400 words

Generate only the cover letter content without any additional formatting or explanations.`;

      return await generateCoverLetter(prompt, jobDescription);
    } catch (error) {
      console.error("Failed to generate enhanced cover letter:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
      <DashboardNav user={user!} credits={profile?.credits || 0} />

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
                Cover Letter Generator
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                AI-powered cover letter based on your resume: {resume.filename}
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                    Job Details (Optional)
                  </CardTitle>
                  <CardDescription>
                    Provide job details to create a more targeted cover letter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        placeholder="e.g., Senior Software Engineer"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g., Tech Corp Inc."
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="jobDescription">
                      Job Description (Optional)
                    </Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here for better matching..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Targeted Cover Letter
                  </Button>
                </CardContent>
              </Card>

              {/* Cover Letter Content */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-heading flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-green-600" />
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
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {resume.parsed_data && resume.status === "completed" ? (
                    <div className="space-y-4">
                      <Textarea
                        defaultValue="Your personalized cover letter will appear here after generation..."
                        className="min-h-[500px] font-mono text-sm leading-relaxed"
                        placeholder="Click 'Generate Targeted Cover Letter' above to create your personalized cover letter..."
                      />
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Word count: 0</span>
                        <span>Character count: 0</span>
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
                      <Link href={`/dashboard/resume/${resume.id}`}>
                        <Button className="mt-4">View Resume Analysis</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-16 w-16 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Ready to Generate
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Fill in the job details above and click generate to
                        create your cover letter.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading text-lg">
                      Customization Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                        Research the company's values and culture
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                        Match keywords from the job description
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                        Highlight specific achievements with numbers
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                        Show genuine enthusiasm for the role
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading text-lg">
                      Best Practices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                        Keep it concise (3-4 paragraphs max)
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                        Use a professional but personable tone
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                        Address the hiring manager by name if possible
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                        End with a strong call to action
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
