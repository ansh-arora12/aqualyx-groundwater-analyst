import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { PollutionIndices } from "@/utils/pollutionCalculations";

interface SampleResult {
  sampleId: string;
  latitude: number;
  longitude: number;
  lead: number;
  cadmium: number;
  arsenic: number;
  chromium: number;
  indices: PollutionIndices;
}

interface ResultsTableProps {
  results: SampleResult[];
  onExport: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'safe':
      return <CheckCircle className="h-4 w-4" />;
    case 'moderate':
      return <AlertCircle className="h-4 w-4" />;
    case 'danger':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'safe':
      return 'safe';
    case 'moderate':
      return 'moderate';
    case 'danger':
      return 'danger';
    default:
      return 'moderate';
  }
};

export const ResultsTable = ({ results, onExport }: ResultsTableProps) => {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground font-scientific">Analysis Results</h2>
            <p className="text-muted-foreground mt-2">
              Pollution indices calculated for {results.length} samples
            </p>
          </div>
          <Button onClick={onExport} className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Contamination Assessment Results</CardTitle>
            <CardDescription>
              HPI: Heavy Metal Pollution Index | MI: Metal Index | Cd: Contamination Degree
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sample ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">HPI</TableHead>
                    <TableHead className="text-right">MI</TableHead>
                    <TableHead className="text-right">Cd</TableHead>
                    <TableHead className="text-right">Lead (mg/L)</TableHead>
                    <TableHead className="text-right">Cadmium (mg/L)</TableHead>
                    <TableHead className="text-right">Arsenic (mg/L)</TableHead>
                    <TableHead className="text-right">Chromium (mg/L)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index} className={`hover:bg-${getStatusColor(result.indices.status)}/5`}>
                      <TableCell className="font-medium">{result.sampleId}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${result.indices.status === 'safe' ? 'border-safe text-safe bg-safe/10' : ''}
                            ${result.indices.status === 'moderate' ? 'border-moderate text-moderate bg-moderate/10' : ''}
                            ${result.indices.status === 'danger' ? 'border-danger text-danger bg-danger/10' : ''}
                            flex items-center gap-1 w-fit
                          `}
                        >
                          {getStatusIcon(result.indices.status)}
                          {result.indices.statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-mono ${
                        result.indices.hpi > 100 ? 'text-danger font-semibold' :
                        result.indices.hpi > 50 ? 'text-moderate font-semibold' :
                        'text-safe'
                      }`}>
                        {result.indices.hpi}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${
                        result.indices.mi > 1.5 ? 'text-danger font-semibold' :
                        result.indices.mi > 1 ? 'text-moderate font-semibold' :
                        'text-safe'
                      }`}>
                        {result.indices.mi}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${
                        result.indices.cd > 3 ? 'text-danger font-semibold' :
                        result.indices.cd > 1.5 ? 'text-moderate font-semibold' :
                        'text-safe'
                      }`}>
                        {result.indices.cd}
                      </TableCell>
                      <TableCell className={`text-right font-mono text-sm ${
                        result.lead > 0.01 ? 'text-danger' : 'text-muted-foreground'
                      }`}>
                        {result.lead.toFixed(4)}
                      </TableCell>
                      <TableCell className={`text-right font-mono text-sm ${
                        result.cadmium > 0.003 ? 'text-danger' : 'text-muted-foreground'
                      }`}>
                        {result.cadmium.toFixed(4)}
                      </TableCell>
                      <TableCell className={`text-right font-mono text-sm ${
                        result.arsenic > 0.01 ? 'text-danger' : 'text-muted-foreground'
                      }`}>
                        {result.arsenic.toFixed(4)}
                      </TableCell>
                      <TableCell className={`text-right font-mono text-sm ${
                        result.chromium > 0.05 ? 'text-danger' : 'text-muted-foreground'
                      }`}>
                        {result.chromium.toFixed(4)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-3">Reference Standards (WHO Guidelines)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Lead:</span>
                  <span className="ml-1 text-muted-foreground">≤ 0.01 mg/L</span>
                </div>
                <div>
                  <span className="font-medium">Cadmium:</span>
                  <span className="ml-1 text-muted-foreground">≤ 0.003 mg/L</span>
                </div>
                <div>
                  <span className="font-medium">Arsenic:</span>
                  <span className="ml-1 text-muted-foreground">≤ 0.01 mg/L</span>
                </div>
                <div>
                  <span className="font-medium">Chromium:</span>
                  <span className="ml-1 text-muted-foreground">≤ 0.05 mg/L</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};