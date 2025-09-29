import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SampleData {
  sampleId: string;
  latitude: number;
  longitude: number;
  lead: number;
  cadmium: number;
  arsenic: number;
  chromium: number;
  [key: string]: string | number;
}

interface DataUploadProps {
  onDataUploaded: (data: SampleData[]) => void;
}

export const DataUpload = ({ onDataUploaded }: DataUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const validateData = (data: any[]): { valid: boolean; errors: string[]; samples: SampleData[] } => {
    const errors: string[] = [];
    const validSamples: SampleData[] = [];
    
    if (!data || data.length === 0) {
      errors.push("File is empty or invalid");
      return { valid: false, errors, samples: [] };
    }

    const requiredFields = ['sampleId', 'latitude', 'longitude', 'lead', 'cadmium', 'arsenic', 'chromium'];
    
    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      
      // Check required fields
      requiredFields.forEach(field => {
        const key = Object.keys(row).find(k => 
          k.toLowerCase().replace(/[^a-z0-9]/g, '') === field.toLowerCase()
        );
        if (!key || row[key] === undefined || row[key] === '') {
          rowErrors.push(`Missing ${field}`);
        }
      });
      
      if (rowErrors.length === 0) {
        // Create sample data with normalized field names
        const sample: SampleData = {
          sampleId: String(row[Object.keys(row).find(k => k.toLowerCase().includes('sample')) || 'sampleId'] || `Sample_${index + 1}`),
          latitude: parseFloat(row[Object.keys(row).find(k => k.toLowerCase().includes('lat')) || 'latitude'] || 0),
          longitude: parseFloat(row[Object.keys(row).find(k => k.toLowerCase().includes('lon')) || 'longitude'] || 0),
          lead: parseFloat(row[Object.keys(row).find(k => k.toLowerCase().includes('lead') || k.toLowerCase().includes('pb')) || 'lead'] || 0),
          cadmium: parseFloat(row[Object.keys(row).find(k => k.toLowerCase().includes('cadmium') || k.toLowerCase().includes('cd')) || 'cadmium'] || 0),
          arsenic: parseFloat(row[Object.keys(row).find(k => k.toLowerCase().includes('arsenic') || k.toLowerCase().includes('as')) || 'arsenic'] || 0),
          chromium: parseFloat(row[Object.keys(row).find(k => k.toLowerCase().includes('chromium') || k.toLowerCase().includes('cr')) || 'chromium'] || 0),
        };
        
        // Validate numeric ranges
        if (Math.abs(sample.latitude) > 90) rowErrors.push("Invalid latitude");
        if (Math.abs(sample.longitude) > 180) rowErrors.push("Invalid longitude");
        if (sample.lead < 0 || sample.cadmium < 0 || sample.arsenic < 0 || sample.chromium < 0) {
          rowErrors.push("Heavy metal concentrations cannot be negative");
        }
        
        if (rowErrors.length === 0) {
          validSamples.push(sample);
        }
      }
      
      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
      }
    });
    
    return { 
      valid: errors.length === 0, 
      errors, 
      samples: validSamples 
    };
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
  };

  const handleFile = useCallback(async (file: File) => {
    setUploadStatus('uploading');
    setErrorMessage('');
    
    try {
      const text = await file.text();
      let data: any[];
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        data = parseCSV(text);
      } else {
        throw new Error('Unsupported file format. Please use CSV files.');
      }
      
      const validation = validateData(data);
      
      if (validation.valid) {
        setUploadStatus('success');
        onDataUploaded(validation.samples);
        toast({
          title: "Data uploaded successfully",
          description: `Processed ${validation.samples.length} samples`,
        });
      } else {
        setUploadStatus('error');
        setErrorMessage(validation.errors.slice(0, 5).join('\n'));
        toast({
          title: "Data validation failed",
          description: "Please check your file format and data",
          variant: "destructive",
        });
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: "Upload failed",
        description: "Please check your file and try again",
        variant: "destructive",
      });
    }
  }, [onDataUploaded, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <section id="upload" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground font-scientific">Upload Your Data</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your groundwater sample data in CSV format. Our system will automatically validate 
            and process your data for contamination analysis.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Upload
              </CardTitle>
              <CardDescription>
                Supports CSV files with columns: Sample ID, Latitude, Longitude, Lead, Cadmium, Arsenic, Chromium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-primary bg-primary/10' 
                    : uploadStatus === 'success' 
                    ? 'border-safe bg-safe/10' 
                    : uploadStatus === 'error'
                    ? 'border-danger bg-danger/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                {uploadStatus === 'uploading' && (
                  <div className="space-y-4">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-muted-foreground">Processing your data...</p>
                  </div>
                )}
                
                {uploadStatus === 'success' && (
                  <div className="space-y-4">
                    <CheckCircle className="h-12 w-12 text-safe mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-safe">Upload Successful!</p>
                      <p className="text-muted-foreground">Your data has been validated and processed.</p>
                    </div>
                  </div>
                )}
                
                {uploadStatus === 'error' && (
                  <div className="space-y-4">
                    <AlertTriangle className="h-12 w-12 text-danger mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-danger">Upload Failed</p>
                      <Alert className="mt-4 border-danger bg-danger/10">
                        <AlertDescription className="whitespace-pre-line text-sm">
                          {errorMessage}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}
                
                {uploadStatus === 'idle' && (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-semibold mb-2">Drop your CSV file here</p>
                      <p className="text-muted-foreground mb-4">or click to browse</p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileInput}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button asChild className="bg-primary hover:bg-primary/90">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Choose File
                        </label>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {uploadStatus !== 'success' && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Required CSV Format:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Required columns:</strong> Sample ID, Latitude, Longitude, Lead (mg/L), Cadmium (mg/L), Arsenic (mg/L), Chromium (mg/L)</p>
                    <p><strong>Data validation:</strong> Coordinates must be valid, metal concentrations must be non-negative</p>
                    <p><strong>Example:</strong> Sample_001, 28.6139, 77.2090, 0.05, 0.01, 0.02, 0.03</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};