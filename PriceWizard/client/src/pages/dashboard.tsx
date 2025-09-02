import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { api, type PricingAnalysis } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartLine, Building, Share, ArrowLeft, TrendingUp, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: analyses = [], isLoading } = useQuery<PricingAnalysis[]>({
    queryKey: ["/api/analysis/history/demo-user"],
    enabled: true,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>;
      case "running":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ChartLine className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Analysis Dashboard</h1>
                <p className="text-sm text-muted-foreground">View and manage your pricing analyses</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyses?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyses?.filter(a => {
                    const analysisDate = new Date(a.createdAt);
                    const now = new Date();
                    return analysisDate.getMonth() === now.getMonth() && 
                           analysisDate.getFullYear() === now.getFullYear();
                  }).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Analyses run
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <ChartLine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyses?.length ? 
                    Math.round(analyses.reduce((acc, a) => acc + (a.confidenceScore || 0), 0) / analyses.length) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Analysis confidence
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyses?.length ? 
                    Math.round((analyses.filter(a => a.status === 'completed').length / analyses.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Successful analyses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analysis History */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Analysis History</CardTitle>
                <Link href="/">
                  <Button data-testid="button-new-analysis">
                    <ChartLine className="mr-2" size={16} />
                    New Analysis
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : analyses && analyses.length > 0 ? (
                <div className="space-y-4">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`analysis-${analysis.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            Company Analysis #{analysis.id.slice(-6)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(analysis.createdAt))} ago
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          {analysis.recommendedPrice && (
                            <div className="font-bold text-foreground">
                              {analysis.recommendedPrice}
                            </div>
                          )}
                          {analysis.confidenceScore && (
                            <div className="text-sm text-muted-foreground">
                              {analysis.confidenceScore}% confidence
                            </div>
                          )}
                        </div>
                        
                        {getStatusBadge(analysis.status)}
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" data-testid={`button-view-${analysis.id}`}>
                            View Report
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`button-share-${analysis.id}`}>
                            <Share size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ChartLine size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No analyses yet</h3>
                  <p className="text-sm mb-4">Run your first pricing analysis to see results here</p>
                  <Link href="/">
                    <Button data-testid="button-get-started">Get Started</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
