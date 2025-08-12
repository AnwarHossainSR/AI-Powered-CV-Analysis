import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Target, Award, ArrowRight } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function AboutPage() {
  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-founder",
      bio: "Former HR executive with 15+ years in talent acquisition and resume optimization.",
    },
    {
      name: "Dr. Michael Chen",
      role: "CTO & Co-founder",
      bio: "AI researcher and former Google engineer specializing in natural language processing.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      bio: "Product strategist focused on creating intuitive experiences for job seekers and recruiters.",
    },
    {
      name: "David Kim",
      role: "Lead AI Engineer",
      bio: "Machine learning expert with expertise in document processing and data extraction.",
    },
  ]

  const stats = [
    { number: "50K+", label: "Resumes Analyzed" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "500+", label: "Companies Trust Us" },
    { number: "24/7", label: "Support Available" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">About CV Analyzer</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to revolutionize how resumes are analyzed and optimized, making career advancement
            accessible to everyone through the power of AI.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            <p className="mt-4 text-lg text-gray-600">
              We believe that everyone deserves equal opportunities in their career journey. Traditional resume
              screening is often inconsistent and biased. Our AI-powered platform provides objective, comprehensive
              analysis that helps both job seekers optimize their resumes and employers make better hiring decisions.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Accuracy</h3>
                  <p className="text-sm text-gray-600">95% parsing accuracy</p>
                </div>
              </div>
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Quality</h3>
                  <p className="text-sm text-gray-600">Enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stat.number}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Our Values</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Transparency</h3>
                <p className="mt-2 text-gray-600">
                  We believe in clear, honest communication about how our AI works and what data we collect.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Inclusivity</h3>
                <p className="mt-2 text-gray-600">
                  Our AI is trained to be fair and unbiased, promoting equal opportunities for all candidates.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Excellence</h3>
                <p className="mt-2 text-gray-600">
                  We continuously improve our technology to provide the most accurate and useful insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Meet Our Team</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="bg-white shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 font-medium">{member.role}</p>
                  <p className="mt-2 text-sm text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold">Join us in revolutionizing resume analysis</h2>
          <p className="mt-4 text-xl text-blue-100">Experience the future of AI-powered career tools today.</p>
          <div className="mt-6">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
