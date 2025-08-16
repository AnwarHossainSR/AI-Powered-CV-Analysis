"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface FileUploadProps {
  userId: string;
  credits: number;
  onUploadSuccess?: () => void;
}

interface UploadedFile {
  file: File;
  id?: string;
  status: "ready" | "uploading" | "processing" | "completed" | "failed";
  progress?: number;
  error?: string;
}

export default function FileUpload({
  userId,
  credits,
  onUploadSuccess,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Accepted files:", acceptedFiles);

    const validFiles = acceptedFiles.filter((file) => {
      const isValid =
        file &&
        file.name &&
        file.size !== undefined &&
        file.size > 0 &&
        file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValid) {
        console.log("Invalid file:", {
          name: file?.name,
          size: file?.size,
          type: file?.type,
        });
      }

      return isValid;
    });

    if (validFiles.length !== acceptedFiles.length) {
      const invalidCount = acceptedFiles.length - validFiles.length;
      toast.error(
        `${invalidCount} file(s) were invalid and skipped (empty, too large, or corrupted)`
      );
    }

    if (validFiles.length === 0) {
      toast.error("No valid files selected");
      return;
    }

    const filesWithStatus: UploadedFile[] = validFiles.map((file) => {
      console.log("File being added:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      return {
        file,
        status: "ready",
        progress: undefined,
      };
    });

    setUploadedFiles((prev) => [...prev, ...filesWithStatus]);
  }, []);

  // Helper function to update file status with error handling
  const updateFileStatus = (
    index: number,
    status: UploadedFile["status"],
    progress?: number,
    error?: string
  ) => {
    setUploadedFiles((prev) =>
      prev.map((f, idx) =>
        idx === index
          ? {
              ...f,
              status,
              progress: progress !== undefined ? progress : f.progress,
              error,
            }
          : f
      )
    );
  };

  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return;
    if (credits < uploadedFiles.length) {
      toast.error(
        `Insufficient credits. You need ${uploadedFiles.length} credits but only have ${credits}.`
      );
      return;
    }

    setUploading(true);
    let hasSuccessfulUploads = false;

    try {
      const uploadPromises = uploadedFiles.map(async (uploadedFile, index) => {
        const file = uploadedFile.file;

        try {
          // More robust file validation
          if (
            !file ||
            !file.name ||
            file.size === undefined ||
            file.size === 0
          ) {
            const errorMsg = `Invalid file: ${file?.name || "Unknown file"}`;
            console.error(`Invalid file at index ${index}:`, {
              exists: !!file,
              hasName: !!file?.name,
              hasSize: file?.size !== undefined,
              size: file?.size,
            });
            updateFileStatus(index, "failed", 0, errorMsg);
            toast.error(errorMsg);
            return;
          }

          // Update file status to uploading
          updateFileStatus(index, "uploading", 25);

          // Create FormData for file upload
          const formData = new FormData();
          formData.append("file", file);

          // Set up fetch with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
          }, 60000); // 60 second timeout

          let response;
          try {
            response = await fetch("/api/resumes/upload", {
              method: "POST",
              body: formData,
              signal: controller.signal,
            });
          } catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === "AbortError") {
              throw new Error("Upload timeout - please try again");
            }

            // Network or other fetch errors
            throw new Error(fetchError.message || "Network error occurred");
          }

          clearTimeout(timeoutId);

          // Check if response is ok
          if (!response.ok) {
            let errorMessage = "Upload failed";
            try {
              const errorData = await response.json();
              errorMessage =
                errorData.error ||
                errorData.message ||
                `Server error: ${response.status}`;
            } catch (jsonError) {
              errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
          }

          // Parse response
          let result;
          try {
            result = await response.json();
          } catch (jsonError) {
            throw new Error("Invalid response from server");
          }

          // Validate response data
          if (!result || !result.resumeId) {
            throw new Error("Invalid response: missing resume ID");
          }

          // Update progress through different stages
          updateFileStatus(index, "processing", 75);

          // Simulate a small delay for processing feedback (optional)
          await new Promise((resolve) => setTimeout(resolve, 500));

          // File processed successfully
          updateFileStatus(index, "completed", 100);
          hasSuccessfulUploads = true;

          toast.success(`${file.name} analyzed successfully!`);
        } catch (processingError: any) {
          console.error(`Processing error for file ${index}:`, processingError);
          const errorMessage =
            processingError.message || "Unknown error occurred";

          updateFileStatus(index, "failed", 0, errorMessage);
          toast.error(`Failed to analyze ${file.name}: ${errorMessage}`);
        }
      });

      // Wait for all uploads to complete
      await Promise.allSettled(uploadPromises);

      // Only redirect if we have successful uploads
      if (hasSuccessfulUploads) {
        // Wait a moment then refresh and redirect
        setTimeout(() => {
          onUploadSuccess?.();
          router.refresh();
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      console.error("General upload error:", error);

      // Mark any files that are still in progress as failed
      setUploadedFiles((prev) =>
        prev.map((f, idx) => {
          if (f.status === "uploading" || f.status === "processing") {
            return {
              ...f,
              status: "failed",
              progress: 0,
              error: "Upload interrupted",
            };
          }
          return f;
        })
      );

      toast.error("Upload process failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const retryFile = (index: number) => {
    updateFileStatus(index, "ready", undefined, undefined);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "uploading":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "ready":
        return <FileText className="h-5 w-5 text-gray-600" />;
      default:
        return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Analysis Complete";
      case "processing":
        return "Analyzing with AI...";
      case "uploading":
        return "Uploading...";
      case "failed":
        return "Analysis Failed";
      case "ready":
        return "Ready to Upload";
      default:
        return "Ready to Upload";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "processing":
        return "text-blue-600";
      case "uploading":
        return "text-blue-600";
      case "failed":
        return "text-red-600";
      case "ready":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const readyFiles = uploadedFiles.filter((f) => f.status === "ready");
  const failedFiles = uploadedFiles.filter((f) => f.status === "failed");

  return (
    <div className="space-y-6">
      {/* Enhanced Drop Zone */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={`p-12 text-center cursor-pointer transition-all duration-200 rounded-lg ${
              isDragActive
                ? "border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed"
                : "hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <div
              className={`transition-transform duration-200 ${
                isDragActive ? "scale-110" : ""
              }`}
            >
              <Upload
                className={`mx-auto h-16 w-16 transition-colors ${
                  isDragActive ? "text-blue-500" : "text-gray-400"
                }`}
              />
            </div>
            <div className="mt-6">
              <p className="text-xl font-semibold text-gray-900">
                {isDragActive ? "Drop your files here" : "Upload Your Resume"}
              </p>
              <p className="mt-2 text-gray-600">
                Drag and drop your resume files here, or click to browse
              </p>
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  PDF, DOC, DOCX, TXT
                </span>
                <span>Max 10MB each</span>
                <span>1 credit per file</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced File List */}
      {uploadedFiles.length > 0 && (
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Files Ready for Processing
              </h3>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {uploadedFiles.length} file
                {uploadedFiles.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile, index) => {
                const file = uploadedFile.file;
                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          {getStatusIcon(uploadedFile.status)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full border ${
                                uploadedFile.status === "completed"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : uploadedFile.status === "processing"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : uploadedFile.status === "uploading"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : uploadedFile.status === "failed"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                            >
                              {getStatusText(uploadedFile.status)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="font-medium">
                              {formatFileSize(file.size)}
                            </span>
                            <span className="uppercase tracking-wide">
                              {file.type.split("/")[1] || "Unknown"}
                            </span>
                          </div>

                          {/* Error Message */}
                          {uploadedFile.status === "failed" &&
                            uploadedFile.error && (
                              <div className="mt-2">
                                <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                  {uploadedFile.error}
                                </p>
                              </div>
                            )}

                          {/* Progress Bar */}
                          {uploadedFile.progress !== undefined &&
                            uploadedFile.progress > 0 &&
                            uploadedFile.progress < 100 && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{uploadedFile.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{
                                      width: `${uploadedFile.progress}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Retry Button for Failed Files */}
                        {uploadedFile.status === "failed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryFile(index)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}

                        {/* Remove Button */}
                        {uploadedFile.status !== "processing" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Enhanced Action Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="text-sm">
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-semibold text-gray-900 ml-1">
                      {readyFiles.length} credit
                      {readyFiles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span
                      className={`font-semibold ml-1 ${
                        credits >= readyFiles.length
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {credits} credit{credits !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {failedFiles.length > 0 && (
                    <div className="text-sm">
                      <span className="text-red-600 font-medium">
                        {failedFiles.length} failed
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={uploadFiles}
                  disabled={
                    uploading ||
                    credits < readyFiles.length ||
                    readyFiles.length === 0
                  }
                  className="bg-black hover:bg-gray-800 text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Files...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Analyze {readyFiles.length} File
                      {readyFiles.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
