"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface FileUploadProps {
  userId: string
  credits: number
  onUploadSuccess?: () => void
}

interface UploadedFile extends File {
  id?: string
  status?: "uploading" | "processing" | "completed" | "failed"
  progress?: number
}

export default function FileUpload({ userId, credits, onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const router = useRouter()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithStatus = acceptedFiles.map((file) => ({
      ...file,
      status: "uploading" as const,
      progress: 0,
    }))
    setUploadedFiles((prev) => [...prev, ...filesWithStatus])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return
    if (credits < uploadedFiles.length) {
      alert(`Insufficient credits. You need ${uploadedFiles.length} credits but only have ${credits}.`)
      return
    }

    setUploading(true)

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]

        // Update file status to uploading
        setUploadedFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "uploading", progress: 25 } : f)))

        // Upload file to Supabase Storage
        const fileExt = file.name.split(".").pop()
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage.from("resumes").upload(fileName, file)

        if (uploadError) {
          console.error("Upload error:", uploadError)
          setUploadedFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "failed", progress: 0 } : f)))
          continue
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("resumes").getPublicUrl(fileName)

        // Update progress
        setUploadedFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, progress: 50 } : f)))

        // Save resume record to database
        const { data: resumeData, error: dbError } = await supabase
          .from("resumes")
          .insert({
            user_id: userId,
            filename: file.name,
            file_url: publicUrl,
            file_size: file.size,
            file_type: file.type,
            status: "pending",
          })
          .select()
          .single()

        if (dbError) {
          console.error("Database error:", dbError)
          setUploadedFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "failed", progress: 0 } : f)))
          continue
        }

        // Update progress and status
        setUploadedFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, id: resumeData.id, status: "processing", progress: 75 } : f)),
        )

        // Trigger AI processing
        try {
          const response = await fetch("/api/resumes/process", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ resumeId: resumeData.id }),
          })

          if (response.ok) {
            setUploadedFiles((prev) =>
              prev.map((f, idx) => (idx === i ? { ...f, status: "completed", progress: 100 } : f)),
            )
          } else {
            throw new Error("Processing failed")
          }
        } catch (processingError) {
          console.error("Processing error:", processingError)
          setUploadedFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "failed", progress: 0 } : f)))
        }
      }

      // Wait a moment then refresh and redirect
      setTimeout(() => {
        onUploadSuccess?.()
        router.refresh()
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "completed":
        return "Analysis Complete"
      case "processing":
        return "Analyzing with AI..."
      case "failed":
        return "Analysis Failed"
      default:
        return "Ready to Upload"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              {isDragActive ? "Drop your resumes here" : "Upload your resume"}
            </p>
            <p className="mt-2 text-sm text-gray-600">Drag and drop your files here, or click to browse</p>
            <p className="mt-1 text-xs text-gray-500">Supports PDF, DOC, DOCX, TXT (max 10MB each)</p>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Files to Upload</h3>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {getStatusIcon(file.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {getStatusText(file.status)}
                      </p>
                      {file.progress !== undefined && file.progress > 0 && file.progress < 100 && (
                        <div className="mt-1 w-32 bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {file.status !== "processing" && file.status !== "completed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Cost: {uploadedFiles.length} credit{uploadedFiles.length !== 1 ? "s" : ""} • Available: {credits}
              </div>
              <Button
                onClick={uploadFiles}
                disabled={uploading || credits < uploadedFiles.length || uploadedFiles.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Upload & Analyze ${uploadedFiles.length} File${uploadedFiles.length !== 1 ? "s" : ""}`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
