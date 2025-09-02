import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type AnalysisRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Rocket, 
  Building, 
  CheckCircle, 
  BarChart3, 
  DollarSign, 
  Calculator, 
  Crown,
  Download,
  Table,
  Share,
  Info,
  List,
  TrendingUp
} from "lucide-react";

interface PricingAnalysisProps {
  onAnalysisComplete?: (analysis: any) => void;
}

export function PricingAnalysis({ onAnalysisComplete }: PricingAnalysisProps) {
  const [companyInput, setCompanyInput] = useState("");
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisRequest["analysisDepth"]>("standard");
  const [targetMarket, setTargetMarket] = useState<AnalysisRequest["targetMarket"]>("enterprise");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  const { toast } = useToast();

  // Company search query
  const { data: suggestions = [] } = useQuery({
    queryKey: ["/api/companies/search", companyInput],
    queryFn: () => api.searchCompanies(companyInput),
    enabled: companyInput.length > 2,
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: (request: AnalysisRequest) => api.runAnalysis(request),
    onMutate: () => {
      setAnalysisResults(null);
      setAnalysisProgress(0);
      // Simulate progress for better UX with continuous animation
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 95) {
            // Keep it moving very slowly near completion
            return Math.min(prev + Math.random() * 0.5, 98);
          } else if (prev >= 80) {
            // Slow down near the end
            return prev + Math.random() * 3;
          } else if (prev >= 60) {
            // Medium pace in middle
            return prev + Math.random() * 5;
          } else {
            // Faster pace at start
            return prev + Math.random() * 8;
          }
        });
      }, 300);
      
      // Store interval reference to clear it later
      (analysisMutation as any).progressInterval = progressInterval;
    },
    onSuccess: (data) => {
      // Clear the progress interval
      if ((analysisMutation as any).progressInterval) {
        clearInterval((analysisMutation as any).progressInterval);
      }
      setAnalysisProgress(100);
      setAnalysisResults(data);
      onAnalysisComplete?.(data);
      toast({
        title: "Analysis Complete",
        description: "Your pricing analysis has been successfully generated.",
      });
    },
    onError: (error) => {
      // Clear the progress interval
      if ((analysisMutation as any).progressInterval) {
        clearInterval((analysisMutation as any).progressInterval);
      }
      setAnalysisProgress(0);
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to run analysis",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!companyInput.trim()) return;

    analysisMutation.mutate({
      companyName: companyInput.trim(),
      analysisDepth,
      targetMarket,
    });
  };

  const handleSuggestionClick = (companyName: string) => {
    setCompanyInput(companyName);
    setShowSuggestions(false);
  };

  const renderSearchForm = () => (
    <Card className="bg-card/95 backdrop-blur-sm p-8 shadow-2xl border border-white/10">
      <div className="mb-6">
        <Label htmlFor="company-search" className="block text-sm font-medium text-white mb-2">
          Product or Service URL
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-muted-foreground" size={16} />
          </div>
          <Input
            id="company-search"
            type="text"
            className="w-full pl-12 pr-4 py-4 text-lg"
            placeholder="e.g., https://dynamics.microsoft.com/en-us/sustainability, https://salesforce.com/products/platform"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => e.key === 'Enter' && !analysisMutation.isPending && handleSubmit()}
            disabled={analysisMutation.isPending}
            data-testid="input-company-search"
          />
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10">
              {suggestions.slice(0, 5).map((company) => (
                <div
                  key={company.id}
                  className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                  onClick={() => handleSuggestionClick(company.name)}
                  data-testid={`suggestion-${company.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="text-blue-600" size={12} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{company.name}</p>
                      {company.description && (
                        <p className="text-sm text-muted-foreground">{company.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label className="block text-sm font-medium text-white mb-2">Analysis Depth</Label>
          <Select value={analysisDepth} onValueChange={(value) => setAnalysisDepth(value as any)} disabled={analysisMutation.isPending}>
            <SelectTrigger className="w-full py-3" data-testid="select-analysis-depth">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Analysis</SelectItem>
              <SelectItem value="deep">Deep Analysis</SelectItem>
              <SelectItem value="competitive">Competitive Benchmark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-white mb-2">Target Market</Label>
          <Select value={targetMarket} onValueChange={(value) => setTargetMarket(value as any)} disabled={analysisMutation.isPending}>
            <SelectTrigger className="w-full py-3" data-testid="select-target-market">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
              <SelectItem value="mid-market">Mid-Market (100-999 employees)</SelectItem>
              <SelectItem value="smb">SMB (10-99 employees)</SelectItem>
              <SelectItem value="startup">Startup (1-9 employees)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button
        className="w-full px-8 py-4 font-semibold text-lg shadow-lg hover:shadow-xl bg-white text-primary hover:bg-gray-100"
        onClick={handleSubmit}
        disabled={analysisMutation.isPending || !companyInput.trim()}
        data-testid="button-run-analysis"
      >
        <Rocket className="mr-3" size={20} />
        {analysisMutation.isPending ? "Running Analysis..." : "Run AI Ensemble Analysis"}
      </Button>
    </Card>
  );

  const renderLoadingState = () => (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-lg border border-border">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">AI Personas Analyzing...</h3>
              <p className="text-muted-foreground">Our ensemble of AI experts is examining your product from multiple angles</p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Running analysis...</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={Math.min(analysisProgress, 98)} className="w-full h-3 transition-all duration-500 ease-out" />
            </div>
            
            {/* AI Personas Status */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-secondary/50 p-6 border border-border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <BarChart3 className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Market Analyst</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">
                        {analysisProgress > 30 ? "Complete" : "Analyzing..."}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              </Card>
              
              <Card className="bg-secondary/50 p-6 border border-border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Value Engineer</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${analysisProgress > 60 ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-muted-foreground">
                        {analysisProgress > 60 ? "Analyzing..." : "Queued"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className={`h-3 w-full ${analysisProgress > 60 ? '' : 'opacity-50'}`} />
                  <Skeleton className={`h-3 w-4/5 ${analysisProgress > 60 ? '' : 'opacity-50'}`} />
                  <Skeleton className={`h-3 w-3/5 ${analysisProgress > 60 ? '' : 'opacity-50'}`} />
                </div>
              </Card>
              
              <Card className="bg-secondary/50 p-6 border border-border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <Calculator className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Quant Analyst</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${analysisProgress > 80 ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-muted-foreground">
                        {analysisProgress > 80 ? "Analyzing..." : "Queued"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className={`h-3 w-full ${analysisProgress > 80 ? '' : 'opacity-50'}`} />
                  <Skeleton className={`h-3 w-4/5 ${analysisProgress > 80 ? '' : 'opacity-50'}`} />
                  <Skeleton className={`h-3 w-3/5 ${analysisProgress > 80 ? '' : 'opacity-50'}`} />
                </div>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );

  const renderAnalysisResults = () => {
    if (!analysisResults || !analysisResults.analysisResults) return null;
    
    const results = analysisResults.analysisResults;
    
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-12">
              <Badge className="bg-green-500/10 text-green-700 mb-4" data-testid="badge-analysis-complete">
                <CheckCircle className="mr-2" size={16} />
                Analysis Complete
              </Badge>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Pricing Analysis for <span className="text-primary">{companyInput}</span>
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our ensemble of AI experts has analyzed your product from multiple perspectives. Here are their findings and our final recommendation.
              </p>
            </div>

            {/* Executive Summary Card */}
            {results.headOfPricing && (
              <Card className="bg-card border border-border mb-8 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center">
                    <h4 className="text-2xl font-bold mb-4 flex items-center justify-center text-foreground">
                      <Crown className="mr-3 text-primary" size={24} />
                      Final Recommendation
                    </h4>
                    <div className="space-y-4">
                      <div className="text-4xl font-bold text-primary" data-testid="text-recommended-price">
                        {results.headOfPricing.recommendedPrice}
                      </div>
                      <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        {results.headOfPricing.synthesis}
                      </p>
                      <div className="inline-flex items-center space-x-3 bg-primary/10 rounded-full px-6 py-3 mt-4">
                        <span className="text-sm font-medium text-foreground">Confidence Score:</span>
                        <span className="text-xl font-bold text-primary" data-testid="text-confidence-score">
                          {results.headOfPricing.confidencePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Analysis Cards */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* Market Analyst Card */}
              {results.marketAnalyst && (
                <Card className="shadow-lg overflow-hidden animate-fade-in">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <BarChart3 size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">Market Analyst</h4>
                        <p className="text-blue-100">Competitive Positioning</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <h5 className="font-semibold text-foreground mb-3">Market Price Range</h5>
                      <div className="text-2xl font-bold text-primary mb-2" data-testid="text-market-price-range">
                        {results.marketAnalyst.estimatedPriceRange}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {results.marketAnalyst.analysis}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Value Engineer Card */}
              {results.valueEngineer && (
                <Card className="shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">Value Engineer</h4>
                        <p className="text-green-100">Customer ROI Analysis</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <h5 className="font-semibold text-foreground mb-3">Justified Price Point</h5>
                      <div className="text-2xl font-bold text-green-600 mb-2" data-testid="text-justified-price">
                        {results.valueEngineer.justifiedPricePoint}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {results.valueEngineer.analysis}
                      </p>
                    </div>
                    {results.valueEngineer.estimatedValueToCustomer && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h6 className="font-medium text-foreground mb-2">Customer Value</h6>
                        <p className="text-sm text-muted-foreground">
                          {results.valueEngineer.estimatedValueToCustomer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quantitative Analyst Card */}
              {results.quantitativeAnalyst && (
                <Card className="shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Calculator size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">Quant Analyst</h4>
                        <p className="text-purple-100">Statistical Modeling</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <h5 className="font-semibold text-foreground mb-3">Optimal Price Point</h5>
                      <div className="text-2xl font-bold text-purple-600 mb-2" data-testid="text-optimal-price">
                        {results.quantitativeAnalyst.optimalPricePoint}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {results.quantitativeAnalyst.analysis}
                      </p>
                    </div>
                    {results.quantitativeAnalyst.acceptablePriceRange && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h6 className="font-medium text-foreground mb-2">Acceptable Range</h6>
                        <p className="text-sm text-muted-foreground">
                          {results.quantitativeAnalyst.acceptablePriceRange}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Action Items and Export */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h4 className="text-lg font-bold text-foreground mb-4 flex items-center">
                    <List className="text-primary mr-2" />
                    Recommended Next Steps
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <p className="text-muted-foreground">Conduct customer interviews to validate price sensitivity assumptions</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <p className="text-muted-foreground">Test pricing through A/B testing with pilot customers</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <p className="text-muted-foreground">Monitor competitor pricing changes quarterly</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <p className="text-muted-foreground">Develop tiered pricing strategy for different market segments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h4 className="text-lg font-bold text-foreground mb-4 flex items-center">
                    <Download className="text-primary mr-2" />
                    Export & Share
                  </h4>
                  <div className="space-y-3">
                    <Button className="w-full" data-testid="button-download-pdf">
                      <Download className="mr-2" size={16} />
                      Download PDF Report
                    </Button>
                    <Button variant="outline" className="w-full" data-testid="button-export-excel">
                      <Table className="mr-2" size={16} />
                      Export to Excel
                    </Button>
                    <Button variant="outline" className="w-full" data-testid="button-share-analysis">
                      <Share className="mr-2" size={16} />
                      Share Analysis
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Info className="mr-1" size={16} />
                      Analysis saved to your dashboard automatically
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8">
      {/* Search Form Section */}
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
            
            {renderSearchForm()}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {analysisMutation.isPending && renderLoadingState()}

      {/* Analysis Results */}
      {analysisResults && analysisResults.status === "completed" && renderAnalysisResults()}
    </div>
  );
}
