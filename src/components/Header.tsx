import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary shadow-medium">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-scientific">Aqualyx</h1>
            <p className="text-sm text-muted-foreground">Groundwater Assessment Platform</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Upload Data
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Reports
          </Button>
        </nav>
      </div>
    </header>
  );
};