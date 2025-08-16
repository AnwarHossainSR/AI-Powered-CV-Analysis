"use client";

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
import {
  ArrowLeft,
  Briefcase,
  Download,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Resume {
  id: string;
  filename: string;
  status: string;
  parsed_data: any;
}

export default function CoverLetterPage() {
  const params = useParams();
  const resumeId = params.id as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(`/api/resumes/${resumeId}`);
        if (response.ok) {
          const data = await response.json();
          setResume(data);
        } else {
          toast.error("Failed to load resume");
        }
      } catch (error) {
        console.error("Error fetching resume:", error);
        toast.error("Failed to load resume");
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchResume();
    }
  }, [resumeId]);

  useEffect(() => {
    if (coverLetter) {
      setWordCount(
        coverLetter.split(/\s+/).filter((word) => word.length > 0).length
      );
      setCharacterCount(coverLetter.length);
    }
  }, [coverLetter]);

  const handleGenerateCoverLetter = async () => {
    if (!resume) return;

    setGenerating(true);
    try {
      const response = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: resume.id,
          jobTitle,
          companyName,
          jobDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCoverLetter(data.coverLetter);
        toast.success("Cover letter generated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to generate cover letter");
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast.error("Failed to generate cover letter");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!coverLetter) return;

    const element = document.createElement("a");
    const file = new Blob([coverLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${companyName || "general"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Cover letter downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading resume...</span>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Resume not found
          </h3>
          <Link href="/dashboard/resumes">
            <Button className="mt-4">Back to Resumes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
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
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
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
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for better matching..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                <Button
                  onClick={handleGenerateCoverLetter}
                  disabled={generating || resume.status !== "completed"}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {generating
                    ? "Generating..."
                    : "Generate Targeted Cover Letter"}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateCoverLetter}
                      disabled={generating || resume.status !== "completed"}
                    >
                      {generating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!coverLetter}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {resume.status !== "completed" ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Resume Analysis Required
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Your resume needs to be analyzed before we can generate a
                      cover letter.
                    </p>
                    <Link href={`/dashboard/resume/${resume.id}`}>
                      <Button className="mt-4">View Resume Analysis</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      value={
                        coverLetter ||
                        "Click 'Generate Targeted Cover Letter' above to create your personalized cover letter..."
                      }
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="min-h-[500px] font-mono text-sm leading-relaxed"
                      placeholder="Your personalized cover letter will appear here after generation..."
                    />
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Word count: {wordCount}</span>
                      <span>Character count: {characterCount}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customization Tips */}
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

              {/* Best Practices */}
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
  );
}
