// Export utilities for Aqualyx reports

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

/**
 * Export results to CSV format
 */
export const exportToCSV = (results: SampleResult[]): void => {
  if (!results.length) {
    alert('No data to export');
    return;
  }

  // Create CSV header
  const headers = [
    'Sample ID',
    'Latitude',
    'Longitude',
    'Lead (mg/L)',
    'Cadmium (mg/L)',
    'Arsenic (mg/L)',
    'Chromium (mg/L)',
    'HPI',
    'MI', 
    'Cd',
    'Contamination Status',
    'Status Label'
  ];

  // Create CSV rows
  const rows = results.map(result => [
    result.sampleId,
    result.latitude.toFixed(6),
    result.longitude.toFixed(6),
    result.lead.toFixed(6),
    result.cadmium.toFixed(6),
    result.arsenic.toFixed(6),
    result.chromium.toFixed(6),
    result.indices.hpi.toString(),
    result.indices.mi.toString(),
    result.indices.cd.toString(),
    result.indices.status,
    result.indices.statusLabel
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `aqualyx_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Generate comprehensive PDF report content
 */
export const generateReportHTML = (results: SampleResult[]): string => {
  const totalSamples = results.length;
  const safeSamples = results.filter(r => r.indices.status === 'safe').length;
  const moderateSamples = results.filter(r => r.indices.status === 'moderate').length;
  const dangerSamples = results.filter(r => r.indices.status === 'danger').length;
  
  const avgHPI = (results.reduce((sum, r) => sum + r.indices.hpi, 0) / totalSamples).toFixed(2);
  const avgMI = (results.reduce((sum, r) => sum + r.indices.mi, 0) / totalSamples).toFixed(2);
  const avgCd = (results.reduce((sum, r) => sum + r.indices.cd, 0) / totalSamples).toFixed(2);

  const criticalSamples = results
    .filter(r => r.indices.status === 'danger')
    .sort((a, b) => b.indices.hpi - a.indices.hpi)
    .slice(0, 5);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Aqualyx Groundwater Assessment Report</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1e40af;
          font-size: 2.5em;
          margin: 0;
        }
        .header p {
          color: #666;
          margin: 10px 0;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .summary-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #1e40af;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #1e40af;
        }
        .summary-card .value {
          font-size: 2em;
          font-weight: bold;
          color: #333;
        }
        .status-safe { color: #16a34a !important; border-color: #16a34a !important; }
        .status-moderate { color: #ca8a04 !important; border-color: #ca8a04 !important; }
        .status-danger { color: #dc2626 !important; border-color: #dc2626 !important; }
        .section {
          margin: 40px 0;
        }
        .section h2 {
          color: #1e40af;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background-color: #f1f5f9;
          font-weight: 600;
          color: #374151;
        }
        .critical-row {
          background-color: #fef2f2;
        }
        .standards {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        .disclaimer {
          background: #fffbeb;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .disclaimer h4 {
          color: #92400e;
          margin: 0 0 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Aqualyx</h1>
        <p><strong>Groundwater Heavy Metal Contamination Assessment Report</strong></p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>

      <div class="section">
        <h2>Executive Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <h3>Total Samples</h3>
            <div class="value">${totalSamples}</div>
          </div>
          <div class="summary-card status-safe">
            <h3>Safe Samples</h3>
            <div class="value">${safeSamples}</div>
            <small>${((safeSamples/totalSamples)*100).toFixed(1)}%</small>
          </div>
          <div class="summary-card status-moderate">
            <h3>Moderate Risk</h3>
            <div class="value">${moderateSamples}</div>
            <small>${((moderateSamples/totalSamples)*100).toFixed(1)}%</small>
          </div>
          <div class="summary-card status-danger">
            <h3>High Risk</h3>
            <div class="value">${dangerSamples}</div>
            <small>${((dangerSamples/totalSamples)*100).toFixed(1)}%</small>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <h3>Average HPI</h3>
            <div class="value">${avgHPI}</div>
          </div>
          <div class="summary-card">
            <h3>Average MI</h3>
            <div class="value">${avgMI}</div>
          </div>
          <div class="summary-card">
            <h3>Average Cd</h3>
            <div class="value">${avgCd}</div>
          </div>
        </div>
      </div>

      ${criticalSamples.length > 0 ? `
      <div class="section">
        <h2>Critical Contamination Sites</h2>
        <p>The following samples show the highest contamination levels and require immediate attention:</p>
        <table>
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Location</th>
              <th>HPI</th>
              <th>Status</th>
              <th>Primary Concern</th>
            </tr>
          </thead>
          <tbody>
            ${criticalSamples.map(sample => `
              <tr class="critical-row">
                <td><strong>${sample.sampleId}</strong></td>
                <td>${sample.latitude.toFixed(4)}, ${sample.longitude.toFixed(4)}</td>
                <td><strong>${sample.indices.hpi}</strong></td>
                <td>${sample.indices.statusLabel}</td>
                <td>
                  ${sample.lead > 0.01 ? 'Lead exceeded' : ''}
                  ${sample.cadmium > 0.003 ? 'Cadmium exceeded' : ''}
                  ${sample.arsenic > 0.01 ? 'Arsenic exceeded' : ''}
                  ${sample.chromium > 0.05 ? 'Chromium exceeded' : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="section">
        <h2>Methodology</h2>
        <p>This assessment uses three standard pollution indices:</p>
        <ul>
          <li><strong>Heavy Metal Pollution Index (HPI):</strong> Comprehensive index considering all metals with toxicity weighting</li>
          <li><strong>Metal Index (MI):</strong> Simple ratio of concentration to standard limits</li>
          <li><strong>Contamination Degree (Cd):</strong> Sum of all metal concentration ratios</li>
        </ul>
        
        <div class="standards">
          <h3>WHO/EPA Standards Used (mg/L):</h3>
          <ul>
            <li>Lead: ≤ 0.01</li>
            <li>Cadmium: ≤ 0.003</li>
            <li>Arsenic: ≤ 0.01</li>
            <li>Chromium: ≤ 0.05</li>
          </ul>
        </div>
      </div>

      <div class="section">
        <h2>Complete Results Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>HPI</th>
              <th>MI</th>
              <th>Cd</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(result => `
              <tr>
                <td>${result.sampleId}</td>
                <td>${result.indices.hpi}</td>
                <td>${result.indices.mi}</td>
                <td>${result.indices.cd}</td>
                <td>${result.indices.statusLabel}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="disclaimer">
        <h4>Disclaimer</h4>
        <p>This report is generated by Aqualyx automated assessment system. Results are based on WHO/EPA guidelines and standard pollution index calculations. For critical contamination sites, please consult with environmental professionals and conduct additional verification testing.</p>
      </div>

      <div class="footer">
        <p><strong>Aqualyx</strong> - Automated Groundwater Heavy Metal Assessment Platform</p>
        <p>Report generated automatically for research and monitoring purposes</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Export detailed PDF report
 */
export const exportToPDF = (results: SampleResult[]): void => {
  if (!results.length) {
    alert('No data to export');
    return;
  }

  const htmlContent = generateReportHTML(results);
  
  // Create new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  } else {
    alert('Please allow pop-ups to generate the PDF report');
  }
};