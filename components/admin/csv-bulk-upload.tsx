import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  Upload,
  XCircle,
} from "lucide-react";
import Papa from "papaparse";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

interface CSVUploadResult {
  success: boolean;
  planName: string;
  stripeProductId?: string;
  stripePriceId?: string;
  error?: string;
}

interface BillingPlanCSV {
  name: string;
  description: string;
  price: number;
  interval_type: "one_time" | "monthly" | "yearly";
  credits: number;
  features: string[];
  sort_order: number;
}

export function CSVBulkUpload({
  onUploadComplete,
}: {
  onUploadComplete: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<CSVUploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setUploadResults([]);
      setShowResults(false);
    } else {
      toast.error("Please select a valid CSV file");
    }
  };

  const downloadTemplate = () => {
    const template = `name,description,price,interval_type,credits,features,sort_order
Starter Pack,"50 resume analyses to get you started",9.99,one_time,50,"50 AI resume analyses|Basic insights|PDF export",1
Professional Pack,"100 resume analyses for job seekers",17.99,one_time,100,"100 AI resume analyses|Advanced insights|PDF export|Cover letter generation",2
Career Booster,"250 resume analyses for active job hunting",39.99,one_time,250,"250 AI resume analyses|Premium insights|PDF export|Cover letter generation|Priority support",3
Enterprise Pack,"500 resume analyses for recruiters",69.99,one_time,500,"500 AI resume analyses|Enterprise insights|PDF export|Cover letter generation|Priority support|Bulk processing",4
Basic Plan,"Monthly subscription with 25 analyses",14.99,monthly,25,"25 monthly analyses|Basic insights|PDF export|Email support",5
Premium Plan,"Monthly subscription with unlimited analyses",29.99,monthly,-1,"Unlimited analyses|Premium insights|PDF export|Cover letter generation|Priority support|Advanced analytics",6`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "billing_plans_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = async (csvData: string): Promise<BillingPlanCSV[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          try {
            const plans: BillingPlanCSV[] = results.data.map((row: any) => ({
              name: row.name?.toString().trim() || "",
              description: row.description?.toString().trim() || "",
              price: parseFloat(row.price) || 0,
              interval_type:
                row.interval_type?.toString().toLowerCase() || "one_time",
              credits: parseInt(row.credits) || 0,
              features: row.features
                ? row.features
                    .toString()
                    .split("|")
                    .map((f: string) => f.trim())
                    .filter(Boolean)
                : [],
              sort_order: parseInt(row.sort_order) || 0,
            }));
            resolve(plans);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  };

  const createStripeProductAndPlan = async (
    plan: BillingPlanCSV
  ): Promise<CSVUploadResult> => {
    try {
      const response = await fetch("/api/admin/stripe-plans/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: "usd",
          interval_type: plan.interval_type,
          credits: plan.credits,
          features: plan.features,
          sort_order: plan.sort_order,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          planName: plan.name,
          stripeProductId: data.product?.id,
          stripePriceId: data.price?.id,
        };
      } else {
        return {
          success: false,
          planName: plan.name,
          error: data.error || "Failed to create plan",
        };
      }
    } catch (error) {
      return {
        success: false,
        planName: plan.name,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const handleBulkUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadResults([]);

    try {
      const csvText = await file.text();
      const plans = await parseCSV(csvText);

      if (plans.length === 0) {
        toast.error("No valid plans found in CSV file");
        setUploading(false);
        return;
      }

      const results: CSVUploadResult[] = [];
      const totalPlans = plans.length;

      for (let i = 0; i < plans.length; i++) {
        const plan = plans[i];
        const result = await createStripeProductAndPlan(plan);
        results.push(result);

        setUploadProgress(Math.round(((i + 1) / totalPlans) * 100));
        setUploadResults([...results]);
      }

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (successCount > 0) {
        toast.success(
          `Successfully created ${successCount} billing plans${
            failCount > 0 ? ` (${failCount} failed)` : ""
          }`
        );
        onUploadComplete();
      } else {
        toast.error("Failed to create any billing plans");
      }

      setShowResults(true);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process CSV file");
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setFile(null);
    setUploadResults([]);
    setShowResults(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Upload className="w-5 h-5" />
          Bulk Upload CSV
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload a CSV file to create multiple Stripe products and billing plans
          at once
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Download Template</h3>
              <p className="text-sm text-blue-700">
                Get the CSV template with sample data
              </p>
            </div>
          </div>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            size="sm"
            className="border-blue-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-green-300"
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Select CSV File
            </Button>
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                {file.name}
                {!uploading && (
                  <Button
                    onClick={clearUpload}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {file && !uploading && (
            <Button
              onClick={handleBulkUpload}
              className="bg-green-600 hover:bg-green-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload & Create Plans
            </Button>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Creating Stripe products and billing plans...
              </span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {showResults && uploadResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Upload Results</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  {uploadResults.filter((r) => r.success).length} Success
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="w-4 h-4" />
                  {uploadResults.filter((r) => !r.success).length} Failed
                </div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{result.planName}</span>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Created" : "Failed"}
                    </Badge>
                  </div>
                  {result.error && (
                    <p className="text-sm text-red-600 mt-1 ml-6">
                      {result.error}
                    </p>
                  )}
                  {result.success && result.stripeProductId && (
                    <div className="text-xs text-gray-600 mt-1 ml-6">
                      Product: {result.stripeProductId}
                      {result.stripePriceId &&
                        ` • Price: ${result.stripePriceId}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>CSV Format:</strong> name, description, price,
            interval_type, credits, features, sort_order
            <br />
            <strong>Features:</strong> Separate multiple features with pipe (|)
            character
            <br />
            <strong>Credits:</strong> Use -1 for unlimited credits
            <br />
            <strong>Interval:</strong> one_time, monthly, or yearly
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
