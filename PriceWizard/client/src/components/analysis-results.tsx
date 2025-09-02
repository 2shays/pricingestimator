import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BarChart3, DollarSign, Calculator, Crown, Download, Table, Share, Info, List, ExternalLink, Banknote } from "lucide-react";

interface AnalysisResultsProps {
  analysis: {
    id: string;
    analysisResults: any;
    recommendedPrice?: string;
    confidenceScore?: number;
  };
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const results = analysis.analysisResults;
  
  if (!results) {
    return null;
  }

  // Handle case where pricing was found directly on the website
  if (results.pricingFound) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Pricing Found Header */}
            <div className="text-center mb-8">
              <Badge className="bg-blue-500/10 text-blue-700 mb-4" data-testid="badge-pricing-found">
                <Banknote className="mr-2" size={16} />
                Pricing Information Found
              </Badge>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Pricing Available on Website
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We found existing pricing information for {results.companyName}'s {results.productName} directly on their website. No estimation needed!
              </p>
            </div>

            {/* Pricing Information Card */}
            <Card className="bg-card border border-border mb-8 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <h4 className="text-2xl font-bold mb-6 flex items-center justify-center text-foreground">
                    <Banknote className="mr-3 text-primary" size={24} />
                    Found Pricing Information
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-primary/10 rounded-lg p-6">
                      {results.pricingInfo.map((price: string, index: number) => (
                        <div key={index} className="text-xl font-semibold text-primary mb-2" data-testid={`text-found-price-${index}`}>
                          {price}
                        </div>
                      ))}
                    </div>
                    <Button 
                      asChild 
                      className="mt-6"
                      data-testid="button-view-original-pricing"
                    >
                      <a href={results.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2" size={16} />
                        View Original Pricing Page
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Features */}
            {results.features && results.features.length > 0 && (
              <Card className="shadow-lg mb-8">
                <CardHeader>
                  <h4 className="text-xl font-bold text-foreground">Product Features</h4>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {results.features.slice(0, 8).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="text-green-500" size={16} />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Items */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-foreground mb-4 flex items-center">
                  <Info className="text-primary mr-2" />
                  Next Steps
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-muted-foreground">Review the pricing structure on their website for different tiers</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-muted-foreground">Compare features and pricing against your requirements</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-muted-foreground">Contact their sales team for enterprise pricing if needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // Original analysis results (when pricing estimation was needed)
  if (!results.headOfPricing) {
    return null;
  }

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
              Pricing Analysis Results
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our ensemble of AI experts has analyzed your product from multiple perspectives. Here are their findings and our final recommendation.
            </p>
          </div>

          {/* Executive Summary Card */}
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
}
