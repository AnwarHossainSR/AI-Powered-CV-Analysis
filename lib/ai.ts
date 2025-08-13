import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "")

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

export async function parseResumeWithAI(file: File): Promise<{
  data: ResumeData
  confidence: number
  summary: string
}> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64File = buffer.toString("base64")

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `
      Extract structured information from the provided CV/Resume PDF file and return it as JSON.
      Please extract and return ONLY a valid JSON object with these fields:
      {
        "personal_info": {
          "name": "",
          "email": "",
          "phone": "",
          "location": "",
          "linkedin": "",
          "website": ""
        },
        "experience": [
          {
            "company": "",
            "position": "",
            "duration": "",
            "description": "",
            "location": ""
          }
        ],
        "education": [
          {
            "institution": "",
            "degree": "",
            "field": "",
            "graduation_date": "",
            "gpa": ""
          }
        ],
        "skills": {
          "technical": [],
          "soft": [],
          "languages": []
        },
        "certifications": [
          {
            "name": "",
            "issuer": "",
            "date": "",
            "expiry": ""
          }
        ],
        "projects": [
          {
            "name": "",
            "description": "",
            "technologies": [],
            "url": ""
          }
        ],
        "summary": ""
      }
      
      Be thorough and accurate in your extraction. If information is not clearly stated, leave those fields empty.
    `

    const filePart = {
      inlineData: {
        data: base64File,
        mimeType: file.type,
      },
    }

    const result = await model.generateContent([prompt, filePart])
    const response = await result.response
    const text = response.text()

    let parsedData: ResumeData
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, "")
      parsedData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      throw new Error("Failed to parse AI response")
    }

    // Calculate confidence score
    const confidence = calculateConfidenceScore(parsedData)

    // Generate summary
    const summary = await generateSummary(parsedData)

    return {
      data: parsedData,
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

async function generateSummary(parsedData: ResumeData): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `
      Based on the following parsed resume data, generate a concise professional summary (2-3 sentences) that highlights:
      - Key professional strengths and experience level
      - Primary skills and expertise areas
      - Career focus or industry specialization
      
      Parsed data: ${JSON.stringify(parsedData)}
      
      Return only the summary text, no additional formatting or explanations.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text().trim()

    return summary || "Professional with diverse experience and skills."
  } catch (error) {
    console.error("Summary generation error:", error)
    return "Professional with diverse experience and skills."
  }
}

export async function generateCoverLetter(resumeData: ResumeData, jobDescription?: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `
      Generate a professional cover letter based on the following resume data:
      ${JSON.stringify(resumeData)}
      
      ${jobDescription ? `Job Description: ${jobDescription}` : "Create a general cover letter that highlights the candidate's strengths."}
      
      The cover letter should:
      - Be professional and engaging
      - Highlight key achievements and skills
      - Be 3-4 paragraphs long
      - Include proper formatting
      - Match the tone to the candidate's experience level
      
      Return only the cover letter content without any additional formatting or explanations.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error("Cover letter generation error:", error)
    throw new Error("Failed to generate cover letter")
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  return "File will be processed directly by AI"
}
