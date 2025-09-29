import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { generateSummaryStats } from "@/utils/pollutionCalculations";

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

interface StatsDashboardProps {
  results: SampleResult[];
}

const COLORS = {
  safe: 'hsl(var(--safe))',
  moderate: 'hsl(var(--moderate))', 
  danger: 'hsl(var(--danger))',
};

export const StatsDashboard = ({ results }: StatsDashboardProps) => {
  if (!results || results.length === 0) {
    return null;
  }

  const stats = generateSummaryStats(results.map(r => r.indices));
  
  // Prepare chart data
  const pieData = [
    { name: 'Safe', value: stats.distribution.safe.count, color: COLORS.safe },
    { name: 'Moderate', value: stats.distribution.moderate.count, color: COLORS.moderate },
    { name: 'High Risk', value: stats.distribution.danger.count, color: COLORS.danger },
  ].filter(item => item.value > 0);

  const barData = results.slice(0, 10).map(result => ({
    sampleId: result.sampleId.length > 8 ? result.sampleId.substring(0, 8) + '...' : result.sampleId,
    HPI: result.indices.hpi,
    MI: result.indices.mi,
    Cd: result.indices.cd,
  }));

  const metalDistributionData = [
    { 
      metal: 'Lead', 
      average: results.reduce((sum, r) => sum + r.lead, 0) / results.length,
      exceeding: results.filter(r => r.lead > 0.01).length,
      standard: 0.01
    },
    { 
      metal: 'Cadmium', 
      average: results.reduce((sum, r) => sum + r.cadmium, 0) / results.length,
      exceeding: results.filter(r => r.cadmium > 0.003).length,
      standard: 0.003
    },
    { 
      metal: 'Arsenic', 
      average: results.reduce((sum, r) => sum + r.arsenic, 0) / results.length,
      exceeding: results.filter(r => r.arsenic > 0.01).length,
      standard: 0.01
    },
    { 
      metal: 'Chromium', 
      average: results.reduce((sum, r) => sum + r.chromium, 0) / results.length,
      exceeding: results.filter(r => r.chromium > 0.05).length,
      standard: 0.05
    },
  ];

  return (
    <section id="stats-dashboard" className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground font-scientific">Contamination Overview</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Statistical analysis and visualization of groundwater contamination levels across all samples.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Analyzed samples</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Safe Samples</CardTitle>
              <CheckCircle className="h-4 w-4 text-safe" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-safe">{stats.distribution.safe.count}</div>
              <p className="text-xs text-muted-foreground">
                {stats.distribution.safe.percentage}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Samples</CardTitle>
              <AlertTriangle className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger">{stats.distribution.danger.count}</div>
              <p className="text-xs text-muted-foreground">
                {stats.distribution.danger.percentage}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average HPI</CardTitle>
              {stats.averages.hpi > 100 ? 
                <TrendingUp className="h-4 w-4 text-danger" /> :
                <TrendingDown className="h-4 w-4 text-safe" />
              }
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                stats.averages.hpi > 100 ? 'text-danger' :
                stats.averages.hpi > 50 ? 'text-moderate' : 'text-safe'
              }`}>
                {stats.averages.hpi}
              </div>
              <p className="text-xs text-muted-foreground">
                Max: {stats.maximums.hpi}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Contamination Distribution */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Contamination Distribution</CardTitle>
              <CardDescription>Sample categorization by pollution level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pollution Indices Comparison */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Pollution Indices (First 10 Samples)</CardTitle>
              <CardDescription>HPI, MI, and Cd values comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sampleId" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="HPI" fill="hsl(var(--primary))" name="HPI" />
                  <Bar dataKey="MI" fill="hsl(var(--accent))" name="MI" />
                  <Bar dataKey="Cd" fill="hsl(var(--moderate))" name="Cd" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Metal-specific Analysis */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Heavy Metal Analysis</CardTitle>
            <CardDescription>Individual metal contamination statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metalDistributionData.map((metal) => (
                <div key={metal.metal} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{metal.metal}</h4>
                    <Badge 
                      variant={metal.exceeding > 0 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {metal.exceeding} exceeding
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average:</span>
                      <span className="font-mono">{metal.average.toFixed(4)} mg/L</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Standard:</span>
                      <span className="font-mono">{metal.standard} mg/L</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metal.average > metal.standard ? 'bg-danger' : 'bg-safe'
                        }`}
                        style={{ 
                          width: `${Math.min((metal.average / (metal.standard * 2)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};