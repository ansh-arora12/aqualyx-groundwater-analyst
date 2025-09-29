import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface SampleMapProps {
  results: SampleResult[];
}

export const SampleMap = ({ results }: SampleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !results.length) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [20, 0], // Default center
        zoom: 2,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each sample
    const bounds = L.latLngBounds([]);
    
    results.forEach((sample) => {
      if (!sample.latitude || !sample.longitude) return;

      const latLng = L.latLng(sample.latitude, sample.longitude);
      bounds.extend(latLng);

      // Create custom icon based on contamination status
      const getMarkerColor = (status: string) => {
        switch (status) {
          case 'safe': return '#22c55e'; // green
          case 'moderate': return '#f59e0b'; // yellow
          case 'danger': return '#ef4444'; // red
          default: return '#6b7280'; // gray
        }
      };

      const createCustomIcon = (color: string) => {
        return L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            background-color: ${color};
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
      };

      const marker = L.marker(latLng, {
        icon: createCustomIcon(getMarkerColor(sample.indices.status))
      }).addTo(map);

      // Create popup content
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${sample.sampleId}</h3>
          <div style="margin-bottom: 8px;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
              background-color: ${getMarkerColor(sample.indices.status)}20; 
              color: ${getMarkerColor(sample.indices.status)}; 
              border: 1px solid ${getMarkerColor(sample.indices.status)}40;">
              ${sample.indices.statusLabel}
            </span>
          </div>
          <div style="font-size: 12px; line-height: 1.4; color: #666;">
            <div><strong>Location:</strong> ${sample.latitude.toFixed(4)}, ${sample.longitude.toFixed(4)}</div>
            <div style="margin-top: 4px;"><strong>Pollution Indices:</strong></div>
            <div style="margin-left: 8px;">
              <div>HPI: <span style="font-family: monospace; font-weight: 500;">${sample.indices.hpi}</span></div>
              <div>MI: <span style="font-family: monospace; font-weight: 500;">${sample.indices.mi}</span></div>
              <div>Cd: <span style="font-family: monospace; font-weight: 500;">${sample.indices.cd}</span></div>
            </div>
            <div style="margin-top: 4px;"><strong>Heavy Metals (mg/L):</strong></div>
            <div style="margin-left: 8px;">
              <div>Lead: <span style="font-family: monospace; ${sample.lead > 0.01 ? 'color: #ef4444; font-weight: 600;' : ''}">${sample.lead.toFixed(4)}</span></div>
              <div>Cadmium: <span style="font-family: monospace; ${sample.cadmium > 0.003 ? 'color: #ef4444; font-weight: 600;' : ''}">${sample.cadmium.toFixed(4)}</span></div>
              <div>Arsenic: <span style="font-family: monospace; ${sample.arsenic > 0.01 ? 'color: #ef4444; font-weight: 600;' : ''}">${sample.arsenic.toFixed(4)}</span></div>
              <div>Chromium: <span style="font-family: monospace; ${sample.chromium > 0.05 ? 'color: #ef4444; font-weight: 600;' : ''}">${sample.chromium.toFixed(4)}</span></div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });
    });

    // Fit map to show all markers
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [results]);

  if (!results.length) {
    return null;
  }

  const statusCounts = {
    safe: results.filter(r => r.indices.status === 'safe').length,
    moderate: results.filter(r => r.indices.status === 'moderate').length,
    danger: results.filter(r => r.indices.status === 'danger').length,
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-foreground font-scientific">Geographic Distribution</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Interactive map showing contamination levels across all sampling locations. 
            Click on markers for detailed information.
          </p>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Sample Locations</CardTitle>
                <CardDescription>
                  {results.length} samples plotted on map with color-coded contamination status
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="border-safe text-safe bg-safe/10">
                  <div className="w-2 h-2 bg-safe rounded-full mr-2"></div>
                  Safe ({statusCounts.safe})
                </Badge>
                <Badge variant="outline" className="border-moderate text-moderate bg-moderate/10">
                  <div className="w-2 h-2 bg-moderate rounded-full mr-2"></div>
                  Moderate ({statusCounts.moderate})
                </Badge>
                <Badge variant="outline" className="border-danger text-danger bg-danger/10">
                  <div className="w-2 h-2 bg-danger rounded-full mr-2"></div>
                  High Risk ({statusCounts.danger})
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div 
                ref={mapRef} 
                className="w-full h-[500px] rounded-lg border border-border overflow-hidden"
              />
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-medium border border-border/50">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="font-medium">Legend:</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-safe rounded-full border-2 border-white shadow-sm"></div>
                    <span>Safe levels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-moderate rounded-full border-2 border-white shadow-sm"></div>
                    <span>Moderate contamination</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-danger rounded-full border-2 border-white shadow-sm"></div>
                    <span>High contamination</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};