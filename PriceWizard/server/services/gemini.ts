import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "" 
});

export interface PersonaAnalysis {
  analysis: string;
  estimatedPriceRange?: string;
  justifiedPricePoint?: string;
  estimatedValueToCustomer?: string;
  optimalPricePoint?: string;
  acceptablePriceRange?: string;
}

export interface HeadOfPricingAnalysis {
  synthesis: string;
  recommendedPrice: string;
  confidencePercentage: number;
}

export class GeminiAnalysisService {
  private generatePersonaPrompt(
    persona: string,
    companyName: string,
    companyDescription: string,
    targetTier: { name: string; features: string },
    otherAnalyses?: any,
    scrapedContext?: {
      url: string;
      content: string;
      pricingInfo: string[];
      features: string[];
      title: string;
    }
  ): string {
    // Build rich context from scraped data
    let baseInfo = `Company: "${companyName}"\nDescription: ${companyDescription}\nTarget Tier for Analysis: "${targetTier.name}" with features: "${targetTier.features}"\n\n`;
    
    if (scrapedContext) {
      baseInfo += `URL Analyzed: ${scrapedContext.url}\n`;
      baseInfo += `Page Title: ${scrapedContext.title}\n`;
      
      if (scrapedContext.features.length > 0) {
        baseInfo += `Key Features from Website: ${scrapedContext.features.slice(0, 5).join(", ")}\n`;
      }
      
      if (scrapedContext.pricingInfo.length > 0) {
        baseInfo += `Existing Pricing Information: ${scrapedContext.pricingInfo.slice(0, 3).join(", ")}\n`;
      }
      
      if (scrapedContext.content) {
        baseInfo += `Website Content Summary: ${scrapedContext.content.slice(0, 800)}...\n`;
      }
      
      baseInfo += '\n';
    }

    const pricingContext = scrapedContext?.pricingInfo.length ? 
      `\nExisting pricing found: ${scrapedContext.pricingInfo.join(", ")}. Use this as reference but consider the target market size differences.` : '';

    switch (persona) {
      case 'MarketAnalyst':
        return `${baseInfo}Act as a Market Analyst. Using the website content and features listed above, analyze competitive positioning. ${pricingContext} Provide a justifiable monthly price range for the ${targetTier.name} tier. The 'estimatedPriceRange' field must contain ONLY the price string (e.g., '$5,000 - $7,000/month') with no other text. Keep your 'analysis' concise (under 50 words). Respond in JSON format: {"analysis": "...", "estimatedPriceRange": "..."}`;
      
      case 'ValueEngineer':
        return `${baseInfo}Act as a Value Engineer. Based on the features and content above, estimate the financial value (ROI) for customers. ${pricingContext} Consider productivity gains, cost savings, and business impact. Provide a justified monthly price point. The 'justifiedPricePoint' field must contain ONLY the price string (e.g., '$10,000/month'). Keep your 'analysis' concise (under 50 words). Respond in JSON format: {"analysis": "...", "estimatedValueToCustomer": "...", "justifiedPricePoint": "..."}`;
      
      case 'QuantAnalyst':
        return `${baseInfo}Act as a Quantitative Analyst. Using the scraped content and feature analysis, simulate Van Westendorp price sensitivity for this product. ${pricingContext} Consider feature complexity and market positioning. Provide an optimal monthly price point. The 'optimalPricePoint' field must contain ONLY the price string (e.g., '$8,500/month'). Keep your 'analysis' concise (under 50 words). Respond in JSON format: {"analysis": "...", "optimalPricePoint": "...", "acceptablePriceRange": "..."}`;
      
      case 'HeadOfPricing':
        return `You are the Head of Pricing for ${companyName}. You have analyzed their website and have three expert reports for the "${targetTier.name}" tier:\n\n1. Market Analyst:\n${JSON.stringify(otherAnalyses.marketAnalyst, null, 2)}\n\n2. Value Engineer:\n${JSON.stringify(otherAnalyses.valueEngineer, null, 2)}\n\n3. Quantitative Analyst:\n${JSON.stringify(otherAnalyses.quantitativeAnalyst, null, 2)}\n\n${scrapedContext ? `Website analysis shows features: ${scrapedContext.features.slice(0, 3).join(", ")}${pricingContext}` : ''}\n\nSynthesize these analyses considering the actual website content and provide a final recommended monthly price. The 'recommendedPrice' field must contain ONLY the price string (e.g., '$9,000/month'). Explain your reasoning in 'synthesis' (under 80 words). Respond in JSON format: {"synthesis": "...", "recommendedPrice": "...", "confidencePercentage": 0-100}`;
      
      default:
        throw new Error(`Unknown persona: ${persona}`);
    }
  }

  async analyzePersona(
    persona: string,
    companyName: string,
    companyDescription: string,
    targetTier: { name: string; features: string },
    otherAnalyses?: any,
    scrapedContext?: {
      url: string;
      content: string;
      pricingInfo: string[];
      features: string[];
      title: string;
    }
  ): Promise<PersonaAnalysis | HeadOfPricingAnalysis> {
    const prompt = this.generatePersonaPrompt(persona, companyName, companyDescription, targetTier, otherAnalyses, scrapedContext);
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error("No response from Gemini API");
      }

      return JSON.parse(rawText);
    } catch (error) {
      console.error(`Error analyzing ${persona}:`, error);
      throw new Error(`Failed to analyze ${persona}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async runEnsembleAnalysis(
    companyName: string,
    companyDescription: string,
    targetTier: { name: string; features: string },
    scrapedContext?: {
      url: string;
      content: string;
      pricingInfo: string[];
      features: string[];
      title: string;
    }
  ) {
    try {
      // Run base personas in parallel with scraped context
      const [marketAnalyst, valueEngineer, quantitativeAnalyst] = await Promise.all([
        this.analyzePersona('MarketAnalyst', companyName, companyDescription, targetTier, undefined, scrapedContext),
        this.analyzePersona('ValueEngineer', companyName, companyDescription, targetTier, undefined, scrapedContext),
        this.analyzePersona('QuantAnalyst', companyName, companyDescription, targetTier, undefined, scrapedContext),
      ]);

      const baseAnalyses = { marketAnalyst, valueEngineer, quantitativeAnalyst };

      // Run head of pricing synthesis
      const headOfPricing = await this.analyzePersona(
        'HeadOfPricing',
        companyName,
        companyDescription,
        targetTier,
        baseAnalyses,
        scrapedContext
      );

      return {
        ...baseAnalyses,
        headOfPricing,
      };
    } catch (error) {
      console.error('Error in ensemble analysis:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiAnalysisService();
