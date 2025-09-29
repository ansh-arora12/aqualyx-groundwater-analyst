import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { DataUpload } from "@/components/DataUpload";
import { ResultsTable } from "@/components/ResultsTable";
import { StatsDashboard } from "@/components/StatsDashboard";
import { SampleMap } from "@/components/SampleMap";
import { calculatePollutionIndices, MetalConcentrations } from "@/utils/pollutionCalculations";
import { exportToCSV, exportToPDF } from "@/utils/exportUtils";
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

interface SampleResult {
  sampleId: string;
  latitude: number;
  longitude: number;
  lead: number;
  cadmium: number;
  arsenic: number;
  chromium: number;
  indices: {
    hpi: number;
    mi: number;
    cd: number;
    status: 'safe' | 'moderate' | 'danger';
    statusLabel: string;
  };
}

const Index = () => {
  const [uploadedData, setUploadedData] = useState<SampleData[] | null>(null);
  const [analysisResults, setAnalysisResults] = useState<SampleResult[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleDataUploaded = (data: SampleData[]) => {
    setUploadedData(data);
    setAnalysisResults(null);
  };

  const analyzeData = async () => {
    if (!uploadedData) return;
    
    setIsAnalyzing(true);
    
    try {
      // Simulate processing time for user feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results: SampleResult[] = uploadedData.map(sample => {
        const metalConcentrations: MetalConcentrations = {
          lead: sample.lead,
          cadmium: sample.cadmium,
          arsenic: sample.arsenic,
          chromium: sample.chromium,
        };
        
        const indices = calculatePollutionIndices(metalConcentrations);
        
        return {
          ...sample,
          indices,
        };
      });
      
      setAnalysisResults(results);
      
      toast({
        title: "Analysis complete",
        description: `Processed ${results.length} samples successfully`,
      });
      
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "An error occurred during calculation",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when data is uploaded
  useEffect(() => {
    if (uploadedData && !analysisResults && !isAnalyzing) {
      analyzeData();
    }
  }, [uploadedData]);

  const handleExportCSV = () => {
    if (analysisResults) {
      exportToCSV(analysisResults);
      toast({
        title: "Export successful",
        description: "CSV file downloaded successfully",
      });
    }
  };

  const handleExportPDF = () => {
    if (analysisResults) {
      exportToPDF(analysisResults);
      toast({
        title: "Generating report",
        description: "PDF report is being prepared",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <DataUpload onDataUploaded={handleDataUploaded} />
      
      {isAnalyzing && (
        <div className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-medium p-8">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Analyzing Data</h3>
              <p className="text-muted-foreground">
                Computing pollution indices for {uploadedData?.length} samples...
              </p>
            </div>
          </div>
        </div>
      )}
      
      {analysisResults && (
        <>
          <StatsDashboard results={analysisResults} />
          <ResultsTable 
            results={analysisResults} 
            onExport={handleExportCSV}
          />
          <SampleMap results={analysisResults} />
          
          {/* Additional Export Options */}
          <section id="export-options" className="py-16 bg-secondary/20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold mb-6 font-scientific">Export Options</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleExportCSV}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-medium"
                >
                  Download CSV Data
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors shadow-medium"
                >
                  Generate PDF Report
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Index;
