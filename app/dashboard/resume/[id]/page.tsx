import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { ParsedData } from "@/lib/types";
import {
  ArrowLeft,
  Briefcase,
  Code,
  Download,
  FileText,
  Globe,
  GraduationCap,
  User,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface ResumeDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function ResumeDetailsPage(
  props: Promise<ResumeDetailsPageProps>
) {
  const { params } = await props;
  const supabase = await createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get resume and parsed data
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resume) {
    notFound();
  }

  const { data: parsedData } = await supabase
    .from("parsed_data")
    .select("*")
    .eq("resume_id", params.id)
    .single();

  if (!parsedData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Resume not analyzed yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This resume is still being processed or analysis failed.
              </p>
              <div className="mt-6">
                <Link href="/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const data = parsedData as ParsedData;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {resume.filename}
                </h1>
                <p className="text-sm text-gray-600">
                  Analyzed on {new Date(data.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Analysis Complete
              </Badge>
              <Badge variant="outline">
                Confidence: {Math.round((data.confidence_score || 0) * 100)}%
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.personal_info?.name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">
                      {data.personal_info.name}
                    </dd>
                  </div>
                )}
                {data.personal_info?.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">
                      {data.personal_info.email}
                    </dd>
                  </div>
                )}
                {data.personal_info?.phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">
                      {data.personal_info.phone}
                    </dd>
                  </div>
                )}
                {data.personal_info?.location && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Location
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {data.personal_info.location}
                    </dd>
                  </div>
                )}
                {data.personal_info?.linkedin && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      LinkedIn
                    </dt>
                    <dd className="text-sm text-blue-600 hover:underline">
                      <a
                        href={data.personal_info.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {data.personal_info.linkedin}
                      </a>
                    </dd>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {data.summary || "No summary available."}
                </p>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.experience && data.experience.length > 0 ? (
                  <div className="space-y-6">
                    {data.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-blue-200 pl-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {exp.position}
                            </h4>
                            <p className="text-blue-600 font-medium">
                              {exp.company}
                            </p>
                            <p className="text-sm text-gray-500">
                              {exp.duration}
                            </p>
                            {exp.location && (
                              <p className="text-sm text-gray-500">
                                {exp.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-gray-700">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No work experience found.</p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.education && data.education.length > 0 ? (
                  <div className="space-y-4">
                    {data.education.map((edu, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-gray-900">
                          {edu.degree}
                        </h4>
                        <p className="text-blue-600">{edu.institution}</p>
                        <p className="text-sm text-gray-600">{edu.field}</p>
                        {edu.graduation_date && (
                          <p className="text-sm text-gray-500">
                            {edu.graduation_date}
                          </p>
                        )}
                        {edu.gpa && (
                          <p className="text-sm text-gray-500">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No education information found.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.skills?.technical && data.skills.technical.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Technical Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.technical.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills?.soft && data.skills.soft.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Soft Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.soft.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.projects.map((project, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-gray-900">
                          {project.name}
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">
                          {project.description}
                        </p>
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {project.technologies.map((tech, techIndex) => (
                                <Badge
                                  key={techIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
