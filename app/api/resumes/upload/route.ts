import { checkAdminAccess } from "@/lib/admin";
import { parseResumeWithAI } from "@/lib/ai";
import { getUser, getUserProfile } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  let resumeId: string | null = null;
  let fileName: string | null = null;

  try {
    const user = await getUser();
    const profile = await getUserProfile(user.id);
    const isAdimin = await checkAdminAccess(user.id);

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

    // Upload file to Supabase Storage
    fileName = `${user.id}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}-${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, file);

    if (uploadError) {
      console.error("File upload failed:", uploadError.message);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(fileName);

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
      console.error("Resume record creation failed:", resumeError?.message);
      // Clean up uploaded file
      await supabase.storage.from("resumes").remove([fileName]);
      throw new Error("Failed to create resume record");
    }

    resumeId = resume.id;

    try {
      // Process with AI
      console.log("Starting AI processing for:", file.name);
      const {
        data: parsedData,
        confidence,
        summary,
      } = await parseResumeWithAI(file);

      console.log(`AI processing completed. Confidence: ${confidence}`);

      // Validate confidence score before saving
      const confidenceScore = Math.min(Math.max(confidence || 0, 0), 100);

      if (confidenceScore !== confidence) {
        console.warn(
          `Confidence score adjusted from ${confidence} to ${confidenceScore}`
        );
      }

      // Manual transaction: Save all data in sequence with proper rollback on failure
      let parsedDataInserted = false;
      let resumeUpdated = false;
      let creditDeducted = false;

      try {
        // Step 1: Insert parsed data
        const { error: insertError } = await supabase
          .from("parsed_data")
          .insert({
            resume_id: resume.id,
            personal_info: parsedData.personal_info,
            experience: parsedData.experience,
            education: parsedData.education,
            skills: parsedData.skills,
            certifications: parsedData.certifications,
            projects: parsedData.projects,
            summary,
            confidence_score: confidenceScore, // Use validated score
          });

        if (insertError) {
          console.error("Parsed data insertion failed:", insertError.message);
          throw new Error(`Failed to save parsed data: ${insertError.message}`);
        }
        parsedDataInserted = true;

        // Step 2: Update resume with completed status
        const { error: updateError } = await supabase
          .from("resumes")
          .update({
            status: "completed",
            confidence_score: confidenceScore, // Use validated score
            ai_summary: summary,
            updated_at: new Date().toISOString(),
          })
          .eq("id", resume.id);

        if (updateError) {
          console.error("Resume update failed:", updateError.message);
          throw new Error(`Failed to update resume: ${updateError.message}`);
        }
        resumeUpdated = true;

        // Step 3: Deduct credit and record transaction
        const { error: creditError } = await supabase.rpc(
          "update_user_credits",
          {
            user_uuid: user.id,
            credit_amount: -1,
            transaction_type: "usage",
            description_text: `Resume analysis: ${file.name}`,
            resume_uuid: resume.id,
          }
        );

        if (creditError) {
          console.error("Credit deduction failed:", creditError.message);
          throw new Error(`Failed to deduct credits: ${creditError.message}`);
        }
        creditDeducted = true;

        console.log(
          `Resume processing completed successfully for: ${file.name}`
        );
      } catch (transactionError: any) {
        console.error(
          "Transaction failed, initiating rollback:",
          transactionError.message
        );

        // Manual rollback in reverse order
        if (creditDeducted) {
          try {
            await supabase.rpc("update_user_credits", {
              user_uuid: user.id,
              credit_amount: 1,
              transaction_type: "refund",
              description_text: `Refund for failed analysis: ${file.name}`,
              resume_uuid: resume.id,
            });
            console.log("Credit refunded successfully");
          } catch (refundError) {
            console.error("Critical: Failed to refund credit:", refundError);
          }
        }

        if (resumeUpdated) {
          try {
            await supabase
              .from("resumes")
              .update({
                status: "failed",
                error_message: transactionError.message,
                updated_at: new Date().toISOString(),
              })
              .eq("id", resume.id);
            console.log("Resume status reverted to failed");
          } catch (revertError) {
            console.error(
              "Critical: Failed to revert resume status:",
              revertError
            );
          }
        }

        if (parsedDataInserted) {
          try {
            await supabase
              .from("parsed_data")
              .delete()
              .eq("resume_id", resume.id);
            console.log("Parsed data cleaned up successfully");
          } catch (deleteError) {
            console.error(
              "Critical: Failed to delete parsed data:",
              deleteError
            );
          }
        }

        throw transactionError;
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
        confidence: confidenceScore,
        summary,
        creditsUsed: 1,
        remainingCredits: updatedProfile?.credits || 0,
        message: "Resume processed successfully",
      });
    } catch (processingError) {
      console.error("AI processing failed:", processingError);

      // Update resume status to failed
      try {
        await supabase
          .from("resumes")
          .update({
            status: "failed",
            error_message:
              processingError instanceof Error
                ? processingError.message
                : "AI processing failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", resume.id);
      } catch (statusUpdateError) {
        console.error(
          "Critical: Failed to update resume status:",
          statusUpdateError
        );
      }

      throw processingError;
    }
  } catch (error) {
    console.error("Upload API error:", error);

    // Clean up resources on error
    if (fileName) {
      try {
        await supabase.storage.from("resumes").remove([fileName]);
        console.log("Uploaded file cleaned up successfully");
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded file:", cleanupError);
      }
    }

    // If we have a resume record but processing failed, mark it as failed
    if (resumeId) {
      try {
        await supabase
          .from("resumes")
          .update({
            status: "failed",
            error_message:
              error instanceof Error ? error.message : "Unknown error occurred",
            updated_at: new Date().toISOString(),
          })
          .eq("id", resumeId);
      } catch (finalUpdateError) {
        console.error(
          "Critical: Failed final status update:",
          finalUpdateError
        );
      }
    }

    // Return user-friendly error messages
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (errorMessage.includes("Insufficient credits")) {
      return NextResponse.json(
        { error: "Insufficient credits", needsCredits: true },
        { status: 402 }
      );
    }

    if (errorMessage.includes("File too large")) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    if (
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Authentication")
    ) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Resume processing failed",
        message:
          "We encountered an issue processing your resume. Please try again.",
      },
      { status: 500 }
    );
  }
}
