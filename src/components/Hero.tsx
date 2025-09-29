import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, BarChart3, Map, Download } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[600px] bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
      
      <div className="relative container mx-auto px-4 py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 font-scientific">
            Automated Groundwater
            <span className="block text-primary-glow">Heavy Metal Assessment</span>
          </h2>
          
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Streamline your environmental research with automated pollution index calculations, 
            real-time visualization, and comprehensive reporting for groundwater contamination analysis.
          </p>
          
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-medium">
            Start Assessment
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white/30 text-white hover:bg-white/10"
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/sample-data.csv';
              link.download = 'aqualyx-sample-data.csv';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download Sample Data
          </Button>
        </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Upload, title: "Upload Data", desc: "CSV/Excel support with validation" },
            { icon: BarChart3, title: "Auto Calculate", desc: "HPI, MI, Cd indices computed instantly" },
            { icon: Map, title: "Visualize", desc: "Interactive maps and charts" },
            { icon: Download, title: "Export", desc: "PDF/CSV reports ready for publication" }
          ].map((feature, index) => (
            <Card key={index} className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-center hover:bg-white/15 transition-all duration-300">
              <feature.icon className="h-8 w-8 mx-auto mb-3 text-white" />
              <h3 className="font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-sm text-white/80">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};