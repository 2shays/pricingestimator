import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, DollarSign, Calculator } from "lucide-react";

export function LoadingState() {
  return (
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
                <span>Processing...</span>
              </div>
              <Progress value={65} className="w-full h-3" />
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
                      <span className="text-sm text-muted-foreground">Analyzing...</span>
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
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Queued</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full opacity-50" />
                  <Skeleton className="h-3 w-4/5 opacity-50" />
                  <Skeleton className="h-3 w-3/5 opacity-50" />
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
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Queued</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full opacity-50" />
                  <Skeleton className="h-3 w-4/5 opacity-50" />
                  <Skeleton className="h-3 w-3/5 opacity-50" />
                </div>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
