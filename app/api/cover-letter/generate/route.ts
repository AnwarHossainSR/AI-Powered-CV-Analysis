import { generateCoverLetter } from "@/lib/ai"
import { getResume } from "@/lib/queries"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { resumeId, jobTitle, companyName, jobDescription } = await request.json()

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    // Get the resume data
    const resume = await getResume(resumeId, user.id)

    if (!resume || !resume.parsed_data) {
      return NextResponse.json({ error: "Resume not found or not analyzed" }, { status: 404 })
    }

    // Create enhanced job description for better targeting
    const enhancedJobDescription = jobDescription
      ? `Job Title: ${jobTitle || "Not specified"}
       Company: ${companyName || "Not specified"}
       Job Description: ${jobDescription}`
      : undefined

    // Generate cover letter using AI
    const coverLetter = await generateCoverLetter(resume.parsed_data, enhancedJobDescription)

    return NextResponse.json({
      coverLetter,
      wordCount: coverLetter.split(/\s+/).length,
      characterCount: coverLetter.length,
    })
  } catch (error) {
    console.error("Cover letter generation error:", error)
    return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 })
  }
}
