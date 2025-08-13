import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { config } from "./config";

const genAI = new GoogleGenerativeAI(config.GOOGLE_AI_API_KEY || "");

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
  experience: z
    .array(
      z.object({
        company: z.string(),
        position: z.string(),
        duration: z.string(),
        description: z.string(),
        location: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        field: z.string(),
        graduation_date: z.string().optional(),
        gpa: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  skills: z
    .object({
      technical: z.array(z.string()).optional().default([]),
      soft: z.array(z.string()).optional().default([]),
      languages: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({}),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        date: z.string().optional(),
        expiry: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()).optional().default([]),
        url: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  summary: z.string().optional(),
});

export type ResumeData = z.infer<typeof resumeSchema>;

export async function parseResumeWithAI(file: File): Promise<{
  data: ResumeData;
  confidence: number;
  summary: string;
}> {
  try {
    console.log(
      "Starting AI parsing for file:",
      file.name,
      "size:",
      file.size,
      "type:",
      file.type
    );

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString("base64");

    console.log("File converted to base64, length:", base64File.length);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert resume parser. Extract structured information from the provided CV/Resume file and return it as valid JSON.
      
      IMPORTANT: Return ONLY a valid JSON object with no additional text, explanations, or markdown formatting.
      
      Required JSON structure:
      {
        "personal_info": {
          "name": "Full Name",
          "email": "email@example.com",
          "phone": "+1-234-567-8900",
          "location": "City, State/Country",
          "linkedin": "https://linkedin.com/in/username",
          "website": "https://website.com"
        },
        "experience": [
          {
            "company": "Company Name",
            "position": "Job Title",
            "duration": "Start Date - End Date",
            "description": "Detailed description of responsibilities and achievements",
            "location": "City, State"
          }
        ],
        "education": [
          {
            "institution": "University/School Name",
            "degree": "Degree Type",
            "field": "Field of Study",
            "graduation_date": "Year or Month Year",
            "gpa": "3.8/4.0"
          }
        ],
        "skills": {
          "technical": ["Skill 1", "Skill 2", "Skill 3"],
          "soft": ["Leadership", "Communication", "Problem Solving"],
          "languages": ["English", "Spanish", "French"]
        },
        "certifications": [
          {
            "name": "Certification Name",
            "issuer": "Issuing Organization",
            "date": "Issue Date",
            "expiry": "Expiry Date"
          }
        ],
        "projects": [
          {
            "name": "Project Name",
            "description": "Project description",
            "technologies": ["Tech 1", "Tech 2"],
            "url": "https://project-url.com"
          }
        ],
        "summary": "Brief professional summary"
      }
      
      Instructions:
      - Extract all information accurately from the resume
      - If information is not clearly stated, use empty string "" or empty array []
      - Ensure all arrays exist even if empty
      - Use consistent date formats
      - Be thorough in extracting experience descriptions
      - Return valid JSON only
    `;

    let filePart: any;

    // Handle different file types
    if (file.type === "text/plain") {
      // For text files, we can also send as text
      const text = await file.text();
      filePart = {
        text: text,
      };
    } else {
      // For PDF, DOC, DOCX
      filePart = {
        inlineData: {
          data: base64File,
          mimeType: file.type,
        },
      };
    }

    console.log("Sending request to Gemini API...");

    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text();

    console.log("Received response from Gemini API, length:", text.length);
    console.log("Raw response:", text.substring(0, 500) + "..."); // Log first 500 chars

    let parsedData: ResumeData;
    try {
      // Clean the response more thoroughly
      let cleanedText = text.trim();

      // Remove markdown code blocks
      cleanedText = cleanedText.replace(/```json\n?|\n?```/g, "");
      cleanedText = cleanedText.replace(/```\n?|\n?```/g, "");

      // Remove any text before the first {
      const firstBrace = cleanedText.indexOf("{");
      if (firstBrace > 0) {
        cleanedText = cleanedText.substring(firstBrace);
      }

      // Remove any text after the last }
      const lastBrace = cleanedText.lastIndexOf("}");
      if (lastBrace > 0 && lastBrace < cleanedText.length - 1) {
        cleanedText = cleanedText.substring(0, lastBrace + 1);
      }

      console.log(
        "Cleaned text for parsing:",
        cleanedText.substring(0, 300) + "..."
      );

      const rawParsedData = JSON.parse(cleanedText);

      // Validate and transform the data using Zod schema
      parsedData = resumeSchema.parse(rawParsedData);

      console.log("Successfully parsed and validated data");
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response that failed:", text);

      // Return a default structure if parsing fails
      parsedData = {
        personal_info: {},
        experience: [],
        education: [],
        skills: { technical: [], soft: [], languages: [] },
        certifications: [],
        projects: [],
        summary: "Failed to parse resume content",
      };
    }

    // Calculate confidence score
    const confidence = calculateConfidenceScore(parsedData);
    console.log("Calculated confidence score:", confidence);

    // Generate summary
    const summary = await generateSummary(parsedData);
    console.log("Generated summary:", summary.substring(0, 100) + "...");

    return {
      data: parsedData,
      confidence,
      summary,
    };
  } catch (error) {
    console.error("AI parsing error:", error);
    throw new Error(
      `Failed to parse resume with AI: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

function calculateConfidenceScore(data: ResumeData): number {
  let score = 0;
  let maxScore = 0;

  // Personal info scoring
  maxScore += 6;
  if (data.personal_info.name) score += 2;
  if (data.personal_info.email) score += 2;
  if (data.personal_info.phone) score += 1;
  if (data.personal_info.location) score += 1;

  // Experience scoring
  maxScore += 4;
  if (data.experience && data.experience.length > 0) {
    score += 2;
    if (
      data.experience.some(
        (exp) => exp.description && exp.description.length > 50
      )
    )
      score += 2;
  }

  // Education scoring
  maxScore += 2;
  if (data.education && data.education.length > 0) score += 2;

  // Skills scoring
  maxScore += 2;
  if (data.skills?.technical && data.skills.technical.length > 0) score += 1;
  if (data.skills?.soft && data.skills.soft.length > 0) score += 1;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

async function generateSummary(parsedData: ResumeData): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Based on the following parsed resume data, generate a concise professional summary (2-3 sentences) that highlights:
      - Key professional strengths and experience level
      - Primary skills and expertise areas
      - Career focus or industry specialization
      
      Resume data: ${JSON.stringify(parsedData, null, 2)}
      
      Return only the summary text, no additional formatting or explanations.
      If the data is incomplete or empty, return a generic professional summary.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();

    return summary || "Professional with diverse experience and skills.";
  } catch (error) {
    console.error("Summary generation error:", error);
    return "Professional with diverse experience and skills.";
  }
}

export async function generateCoverLetter(
  resumeData: ResumeData,
  jobDescription?: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Generate a professional cover letter based on the following resume data:
      ${JSON.stringify(resumeData, null, 2)}
      
      ${
        jobDescription
          ? `Job Description: ${jobDescription}`
          : "Create a general cover letter that highlights the candidate's strengths."
      }
      
      The cover letter should:
      - Be professional and engaging
      - Highlight key achievements and skills
      - Be 3-4 paragraphs long
      - Include proper formatting
      - Match the tone to the candidate's experience level
      
      Return only the cover letter content without any additional formatting or explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Cover letter generation error:", error);
    throw new Error("Failed to generate cover letter");
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  return "File will be processed directly by AI";
}
