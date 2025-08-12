import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Brain, Zap, Shield, BarChart3, Download, Users, Clock, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Parsing",
      description: "Our state-of-the-art AI extracts and structures data from resumes with 95% accuracy.",
      details: [
        "Extracts personal information, experience, education, and skills",
        "Handles multiple resume formats and layouts",
        "Identifies key achievements and quantifiable results",
        "Recognizes industry-specific terminology",
      ],
    },
    {
      icon: Zap,
      title: "Lightning Fast Processing",
      description: "Get your resume analysis in seconds, not minutes.",
      details: [
        "Average processing time under 10 seconds",
        "Bulk processing for multiple resumes",
        "Real-time status updates",
        "Priority processing for premium users",
      ],
    },
    {
      icon: BarChart3,
      title: "Comprehensive Insights",
      description: "Detailed analysis and actionable recommendations to improve your resume.",
      details: [
        "Skills gap analysis",
        "Industry benchmarking",
        "ATS compatibility scoring",
        "Keyword optimization suggestions",
      ],
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Your data is protected with bank-level security and privacy.",
      details: [
        "End-to-end encryption",
        "GDPR and CCPA compliant",
        "Secure file storage",
        "Automatic data deletion options",
      ],
    },
    {
      icon: Download,
      title: "Multiple Export Formats",
      description: "Export your structured data in various formats for different use cases.",
      details: [
        "JSON for developers and integrations",
        "CSV for spreadsheet analysis",
        "PDF reports for sharing",
        "API access for custom integrations",
      ],
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Perfect for HR teams and recruitment agencies.",
      details: [
        "Team workspaces",
        "Shared resume libraries",
        "Collaborative notes and ratings",
        "Role-based access controls",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Powerful features for
            <span className="text-blue-600"> resume analysis</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform provides everything you need to extract, analyze, and optimize resume data with
            professional-grade accuracy and insights.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-gray-600 mt-2">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="mt-4 text-lg text-gray-600">Get professional resume analysis in three simple steps</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">1. Upload Resume</h3>
              <p className="mt-2 text-gray-600">
                Upload your resume in PDF, Word, or text format. We support all common file types.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">2. AI Analysis</h3>
              <p className="mt-2 text-gray-600">
                Our AI processes your resume in seconds, extracting and structuring all relevant data.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">3. Get Insights</h3>
              <p className="mt-2 text-gray-600">
                Receive detailed analysis, structured data, and actionable recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of professionals who trust our AI-powered resume analysis.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold bg-transparent"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
