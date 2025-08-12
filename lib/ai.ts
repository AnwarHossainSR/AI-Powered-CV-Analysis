import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

// Schema for structured resume data
const resumeSchema = z.object({
  personal_info: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }),
  experience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      duration: z.string(),
      description: z.string(),
      location: z.string().optional(),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      graduation_date: z.string().optional(),
      gpa: z.string().optional(),
    }),
  ),
  skills: z.object({
    technical: z.array(z.string()).optional(),
    soft: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
  }),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string().optional(),
      expiry: z.string().optional(),
    }),
  ),
  languages: z.array(
    z.object({
      language: z.string(),
      proficiency: z.string(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()).optional(),
      url: z.string().optional(),
    }),
  ),
  summary: z.string().optional(),
})

export type ResumeData = z.infer<typeof resumeSchema>

export async function parseResumeWithAI(resumeText: string): Promise<{
  data: ResumeData
  confidence: number
  summary: string
}> {
  try {
    const { object } = await generateObject({
      model: google("gemini-1.5-pro"),
      schema: resumeSchema,
      prompt: `
        You are an expert resume parser. Analyze the following resume text and extract structured information.
        
        Instructions:
        - Extract all personal information (name, email, phone, location, LinkedIn, website)
        - Parse work experience with company, position, duration, and detailed descriptions
        - Extract education details including institution, degree, field of study, graduation date, and GPA if mentioned
        - Categorize skills into technical, soft skills, and languages
        - Extract certifications with issuer and dates
        - Identify projects with descriptions and technologies used
        - Provide a professional summary if one exists or create a brief one based on the content
        - Be thorough and accurate in your extraction
        - If information is not clearly stated, leave those fields empty rather than guessing
        
        Resume text:
        ${resumeText}
      `,
    })

    // Calculate confidence score based on completeness
    const confidence = calculateConfidenceScore(object)

    // Generate summary
    const summary = await generateSummary(resumeText, object)

    return {
      data: object,
      confidence,
      summary,
    }
  } catch (error) {
    console.error("AI parsing error:", error)
    throw new Error("Failed to parse resume with AI")
  }
}

function calculateConfidenceScore(data: ResumeData): number {
  let score = 0
  let maxScore = 0

  // Personal info scoring
  maxScore += 6
  if (data.personal_info.name) score += 2
  if (data.personal_info.email) score += 2
  if (data.personal_info.phone) score += 1
  if (data.personal_info.location) score += 1

  // Experience scoring
  maxScore += 4
  if (data.experience.length > 0) {
    score += 2
    if (data.experience.some((exp) => exp.description.length > 50)) score += 2
  }

  // Education scoring
  maxScore += 2
  if (data.education.length > 0) score += 2

  // Skills scoring
  maxScore += 2
  if (data.skills.technical && data.skills.technical.length > 0) score += 1
  if (data.skills.soft && data.skills.soft.length > 0) score += 1

  return Math.round((score / maxScore) * 100)
}

async function generateSummary(resumeText: string, parsedData: ResumeData): Promise<string> {
  try {
    const { text } = await generateObject({
      model: google("gemini-1.5-pro"),
      schema: z.object({
        summary: z.string(),
      }),
      prompt: `
        Based on the following resume content and parsed data, generate a concise professional summary (2-3 sentences) that highlights:
        - Key professional strengths and experience level
        - Primary skills and expertise areas
        - Career focus or industry specialization
        
        Resume text: ${resumeText.substring(0, 1000)}
        
        Parsed experience: ${JSON.stringify(parsedData.experience.slice(0, 2))}
        Parsed skills: ${JSON.stringify(parsedData.skills)}
      `,
    })

    return text.summary || "Professional with diverse experience and skills."
  } catch (error) {
    console.error("Summary generation error:", error)
    return "Professional with diverse experience and skills."
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type

  if (fileType === "text/plain") {
    return await file.text()
  }

  if (fileType === "application/pdf") {
    // For PDF parsing, we'll use a simple approach
    // In production, you'd want to use a proper PDF parsing library
    return await file.text()
  }

  if (
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // For Word documents, we'll use a simple approach
    // In production, you'd want to use a proper Word parsing library
    return await file.text()
  }

  throw new Error(`Unsupported file type: ${fileType}`)
}
