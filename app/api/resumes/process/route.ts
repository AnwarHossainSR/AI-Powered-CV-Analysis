import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { parseResumeWithAI, extractTextFromFile } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { resumeId } = await request.json()

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    // Get resume record
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Check if already processed
    if (resume.status === "completed") {
      return NextResponse.json({ error: "Resume already processed" }, { status: 400 })
    }

    // Update status to processing
    await supabase.from("resumes").update({ status: "processing" }).eq("id", resumeId)

    try {
      // Download file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("resumes")
        .download(resume.file_url.split("/").pop() || "")

      if (downloadError || !fileData) {
        throw new Error("Failed to download file")
      }

      // Extract text from file
      const resumeText = await extractTextFromFile(fileData as File)

      // Parse with AI
      const { data: parsedData, confidence, summary } = await parseResumeWithAI(resumeText)

      // Save parsed data to database
      const { error: insertError } = await supabase.from("parsed_data").insert({
        resume_id: resumeId,
        personal_info: parsedData.personal_info,
        experience: parsedData.experience,
        education: parsedData.education,
        skills: parsedData.skills,
        certifications: parsedData.certifications,
        languages: parsedData.languages,
        projects: parsedData.projects,
        summary,
        raw_text: resumeText,
        confidence_score: confidence / 100,
      })

      if (insertError) {
        throw new Error("Failed to save parsed data")
      }

      // Deduct credit and record transaction
      const { error: creditError } = await supabase.rpc("update_user_credits", {
        user_uuid: user.id,
        credit_amount: -1,
        transaction_type: "usage",
        description_text: `Resume analysis: ${resume.filename}`,
        resume_uuid: resumeId,
      })

      if (creditError) {
        console.error("Credit deduction error:", creditError)
      }

      // Update resume status to completed
      await supabase.from("resumes").update({ status: "completed" }).eq("id", resumeId)

      return NextResponse.json({
        success: true,
        confidence,
        summary,
      })
    } catch (processingError) {
      console.error("Processing error:", processingError)

      // Update status to failed
      await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId)

      return NextResponse.json({ error: "Failed to process resume" }, { status: 500 })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
