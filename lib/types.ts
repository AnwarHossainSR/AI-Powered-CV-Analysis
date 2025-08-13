export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  credits: number;
  subscription_status: "free" | "basic" | "premium";
  subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  file_type: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  confidence_score?: number;
}

export interface ParsedData {
  id: string;
  resume_id: string;
  personal_info?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  experience?: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    location?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    graduation_date?: string;
    gpa?: string;
  }>;
  skills?: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
    expiry?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  summary?: string;
  raw_text?: string;
  confidence_score?: number;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: "purchase" | "usage" | "refund" | "bonus";
  description?: string;
  resume_id?: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  role: "admin" | "super_admin";
  permissions: string[];
  created_at: string;
}
