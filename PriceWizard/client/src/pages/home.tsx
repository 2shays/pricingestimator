import { useState } from "react";
import { Link } from "wouter";
import { CompanySearch } from "@/components/company-search";
import { LoadingState } from "@/components/loading-state";
import { AnalysisResults } from "@/components/analysis-results";
import { useMutation } from "@tanstack/react-query";
import { api, type AnalysisRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChartLine, User, BarChart3, Menu } from "lucide-react";

export default function Home() {
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: (request: AnalysisRequest) => api.runAnalysis(request),
    onSuccess: (data) => {
      setAnalysisResults(data);
      toast({
        title: "Analysis Complete",
        description: "Your pricing analysis has been successfully generated.",
      });
    },
    onError: (error) => {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to run analysis",
        variant: "destructive",
      });
    },
  });

  const handleAnalysisRequest = (request: AnalysisRequest) => {
    setAnalysisResults(null);
    analysisMutation.mutate(request);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-blue-600 via-primary to-purple-700 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <ChartLine className="text-primary" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PricingIQ</h1>
                <p className="text-xs text-white/80">AI-Powered Pricing Analysis</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-white/80 hover:text-white transition">
                Dashboard
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition">
                Analysis History
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition">
                Companies
              </Link>
              <Button className="font-medium bg-white text-primary hover:bg-gray-100" data-testid="button-account">
                <User className="mr-2" size={16} />
                Account
              </Button>
            </nav>
            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-menu">
              <Menu size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Multi-Persona Pricing Intelligence
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Leverage AI-powered analysis from Market Analysts, Value Engineers, and Quantitative Experts to determine optimal pricing strategies for any product or service.
            </p>
            
            <CompanySearch onAnalysisRequest={handleAnalysisRequest} isLoading={analysisMutation.isPending} />
          </div>
        </div>
      </section>

      {/* Loading State */}
      {analysisMutation.isPending && <LoadingState />}

      {/* Analysis Results */}
      {analysisResults && analysisResults.status === "completed" && (
        <AnalysisResults analysis={analysisResults} />
      )}

      {/* Recent Analyses Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Recent Analyses</h3>
                <p className="text-muted-foreground">Your pricing analysis history and saved reports</p>
              </div>
              <Link href="/dashboard">
                <Button data-testid="button-view-all">View All</Button>
              </Link>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Placeholder for recent analyses */}
              <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No analyses yet</p>
                  <p className="text-sm">Run your first pricing analysis to see results here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <ChartLine className="text-primary-foreground" size={16} />
                  </div>
                  <span className="text-lg font-bold">PricingIQ</span>
                </div>
                <p className="text-muted text-sm">
                  AI-powered pricing intelligence for modern businesses. Make data-driven pricing decisions with confidence.
                </p>
              </div>
              <div>
                <h5 className="font-semibold mb-3">Platform</h5>
                <ul className="space-y-2 text-sm text-muted">
                  <li><Link href="/dashboard" className="hover:text-background transition">Dashboard</Link></li>
                  <li><Link href="#" className="hover:text-background transition">Analysis Tools</Link></li>
                  <li><Link href="#" className="hover:text-background transition">Company Database</Link></li>
                  <li><Link href="#" className="hover:text-background transition">Reporting</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-3">Resources</h5>
                <ul className="space-y-2 text-sm text-muted">
                  <li><Link href="#" className="hover:text-background transition">API Documentation</Link></li>
                  <li><Link href="#" className="hover:text-background transition">Pricing Guide</Link></li>
                  <li><Link href="#" className="hover:text-background transition">Best Practices</Link></li>
                  <li><Link href="#" className="hover:text-background transition">Support</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-3">Company</h5>
                <ul className="space-y-2 text-sm text-muted">
                  <li><Link href="#" className="hover:text-background transition">About Us</Link></li>
                  <li><Link href="#" className="hover:text-background transition">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-background transition">Terms of Service</Link></li>
                  <li><Link href="#" className="hover:text-background transition">Contact</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-muted pt-6 text-center text-sm text-muted">
              <p>&copy; 2024 PricingIQ. All rights reserved. Built with AI-powered pricing intelligence.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
