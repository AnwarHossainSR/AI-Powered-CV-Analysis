import { parseResumeWithAI } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credits < 1) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          credits: profile?.credits || 0,
          needsCredits: true,
        },
        { status: 402 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOC, DOCX, and TXT files are supported" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    try {
      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("resumes").getPublicUrl(fileName);
      console.log("file", file);
      // Create resume record with pending status
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          filename: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          file_path: fileName,
          status: "processing",
        })
        .select()
        .single();

      if (resumeError || !resume) {
        console.error("Resume creation error:", resumeError);
        throw new Error("Failed to create resume record");
      }

      // Process with AI
      console.log("Starting AI processing for file:", file.name);
      const {
        data: parsedData,
        confidence,
        summary,
      } = await parseResumeWithAI(file);
      console.log("AI processing completed, confidence:", confidence);

      // Save parsed data to database
      const { error: insertError } = await supabase.from("parsed_data").insert({
        resume_id: resume.id,
        personal_info: parsedData.personal_info,
        experience: parsedData.experience,
        education: parsedData.education,
        skills: parsedData.skills,
        certifications: parsedData.certifications,
        projects: parsedData.projects,
        summary,
        confidence_score: confidence / 100,
      });

      if (insertError) {
        console.error("Parsed data insertion error:", insertError);
        const { error: updateError } = await supabase
          .from("resumes")
          .update({
            status: "failed",
          })
          .eq("id", resume.id);
        throw new Error("Failed to save parsed data");
      }

      // Update resume with parsed data and completed status
      const { error: updateError } = await supabase
        .from("resumes")
        .update({
          status: "completed",
          parsed_data: parsedData,
          confidence_score: confidence,
          ai_summary: summary,
        })
        .eq("id", resume.id);

      if (updateError) {
        console.error("Resume update error:", updateError);
        // Don't fail the request if update fails, data is already saved
      }

      // Deduct credit and record transaction
      const { error: creditError } = await supabase.rpc("update_user_credits", {
        user_uuid: user.id,
        credit_amount: -1,
        transaction_type: "usage",
        description_text: `Resume analysis: ${file.name}`,
        resume_uuid: resume.id,
      });

      if (creditError) {
        console.error("Credit deduction error:", creditError);
        // Don't fail the request if credit deduction fails
      }

      // Get updated credits
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      return NextResponse.json({
        success: true,
        resumeId: resume.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        confidence,
        summary,
        creditsUsed: 1,
        remainingCredits: updatedProfile?.credits || 0,
        message: "Resume processed successfully",
      });
    } catch (processingError) {
      console.error("Processing error:", processingError);

      // If we have a resume record, update it to failed status
      // You might want to store the resume ID before processing starts

      return NextResponse.json(
        {
          error:
            processingError instanceof Error
              ? processingError.message
              : "Failed to process resume",
          details:
            processingError instanceof Error
              ? processingError.stack
              : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
