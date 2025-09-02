import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { api, type AnalysisRequest } from "@/lib/api";
import { Search, Rocket, Building } from "lucide-react";

interface CompanySearchProps {
  onAnalysisRequest: (request: AnalysisRequest) => void;
  isLoading: boolean;
}

export function CompanySearch({ onAnalysisRequest, isLoading }: CompanySearchProps) {
  const [companyInput, setCompanyInput] = useState("");
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisRequest["analysisDepth"]>("standard");
  const [targetMarket, setTargetMarket] = useState<AnalysisRequest["targetMarket"]>("enterprise");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["/api/companies/search", companyInput],
    queryFn: () => api.searchCompanies(companyInput),
    enabled: companyInput.length > 2,
  });

  const handleSubmit = () => {
    if (!companyInput.trim()) return;

    onAnalysisRequest({
      companyName: companyInput.trim(),
      analysisDepth,
      targetMarket,
    });
  };

  const handleSuggestionClick = (companyName: string) => {
    setCompanyInput(companyName);
    setShowSuggestions(false);
  };

  return (
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
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
            disabled={isLoading}
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
      
      {/* Analysis Depth Explanations */}
      <div className="mb-6">
        <Label className="block text-sm font-medium text-white mb-4">Analysis Depth</Label>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h4 className="font-semibold text-white mb-2">Standard Analysis</h4>
            <p className="text-xs text-blue-100">4 AI personas analyze market positioning, customer value, and optimal pricing using proven methodologies.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h4 className="font-semibold text-white mb-2">Deep Analysis</h4>
            <p className="text-xs text-blue-100">Enhanced analysis with additional market research, competitor deep-dive, and expanded AI prompts for comprehensive insights.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h4 className="font-semibold text-white mb-2">Competitive Benchmark</h4>
            <p className="text-xs text-blue-100">Specialized focus on competitor pricing data, market positioning analysis, and strategic pricing recommendations.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label className="block text-sm font-medium text-white mb-2">Select Analysis Type</Label>
          <Select value={analysisDepth} onValueChange={(value) => setAnalysisDepth(value as any)} disabled={isLoading}>
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
          <Label className="block text-sm font-medium text-white mb-2">Number of Employees</Label>
          <Select value={targetMarket} onValueChange={(value) => setTargetMarket(value as any)} disabled={isLoading}>
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
        disabled={isLoading || !companyInput.trim()}
        data-testid="button-run-analysis"
      >
        <Rocket className="mr-3" size={20} />
        {isLoading ? "Running Analysis..." : "Run AI Ensemble Analysis"}
      </Button>
    </Card>
  );
}
