import { storage } from "../storage";
import { geminiService } from "./gemini";
import { urlScraperService } from "./url-scraper";
import type { InsertPricingAnalysis } from "@shared/schema";

export interface AnalysisRequest {
  companyName: string; // This is now treated as a URL
  analysisDepth: string;
  targetMarket: string;
  userId?: string;
}

export class AnalysisService {
  async runAnalysis(request: AnalysisRequest) {
    try {
      const urlToAnalyze = request.companyName; // Now treating this as URL
      
      // Scrape content from the provided URL
      console.log(`Scraping content from: ${urlToAnalyze}`);
      const scrapedContent = await urlScraperService.scrapeURL(urlToAnalyze);
      
      // Check if pricing information was found on the website
      if (scrapedContent.pricingInfo && scrapedContent.pricingInfo.length > 0) {
        console.log(`Pricing found on website: ${scrapedContent.pricingInfo.join(", ")}`);
        
        // Create analysis record with pricing found status
        const analysisRecord: InsertPricingAnalysis = {
          companyId: "", // We'll set this after creating company
          userId: request.userId,
          analysisResults: {
            pricingFound: true,
            url: scrapedContent.url,
            pricingInfo: scrapedContent.pricingInfo,
            companyName: scrapedContent.companyName,
            productName: scrapedContent.productName,
            features: scrapedContent.features,
          },
          status: "completed",
          analysisDepth: request.analysisDepth,
          targetMarket: request.targetMarket,
        };

        // Create a minimal company record for tracking
        let company = await storage.getCompanyByName(scrapedContent.companyName);
        if (!company) {
          company = await storage.createCompany({
            name: scrapedContent.companyName,
            description: scrapedContent.description,
            industry: "Technology",
            size: "Enterprise",
          });
        }
        
        analysisRecord.companyId = company.id;
        const analysis = await storage.createPricingAnalysis(analysisRecord);
        return analysis;
      }
      
      // Find or create company based on scraped data
      let company = await storage.getCompanyByName(scrapedContent.companyName);
      
      if (!company) {
        // Create company with rich scraped data
        company = await storage.createCompany({
          name: scrapedContent.companyName,
          description: scrapedContent.description,
          industry: "Technology", // Could be enhanced with industry detection
          size: "Enterprise", // Could be enhanced with company size detection
          qualitative: scrapedContent.content.slice(0, 500), // Store rich content
        });
      }

      // Get or create pricing tiers
      let tiers = await storage.getPricingTiers(company.id);
      if (tiers.length === 0) {
        // Create tier with scraped product information
        const defaultTier = await storage.createPricingTier({
          companyId: company.id,
          name: scrapedContent.productName || "Professional",
          features: scrapedContent.features.length > 0 
            ? scrapedContent.features.join("; ")
            : "Advanced features for professional use",
          targetMarket: request.targetMarket,
        });
        tiers = [defaultTier];
      }

      // Select target tier for analysis
      const targetTier = tiers.length > 1 ? tiers[1] : tiers[0];

      // Create analysis record
      const analysisRecord: InsertPricingAnalysis = {
        companyId: company.id,
        userId: request.userId,
        analysisResults: {},
        status: "running",
        analysisDepth: request.analysisDepth,
        targetMarket: request.targetMarket,
      };

      const analysis = await storage.createPricingAnalysis(analysisRecord);

      // Run AI analysis with rich scraped data
      try {
        const results = await geminiService.runEnsembleAnalysis(
          scrapedContent.companyName,
          scrapedContent.description,
          {
            name: targetTier.name,
            features: targetTier.features,
          },
          // Pass additional scraped context
          {
            url: scrapedContent.url,
            content: scrapedContent.content,
            pricingInfo: scrapedContent.pricingInfo,
            features: scrapedContent.features,
            title: scrapedContent.title,
          }
        );

        // Update analysis with results
        const updatedAnalysis = await storage.updatePricingAnalysis(analysis.id, {
          analysisResults: results,
          status: "completed",
          recommendedPrice: (results.headOfPricing as any)?.recommendedPrice,
          confidenceScore: (results.headOfPricing as any)?.confidencePercentage,
        });

        return updatedAnalysis;
      } catch (error) {
        // Update analysis with error status
        await storage.updatePricingAnalysis(analysis.id, {
          status: "failed",
          analysisResults: { error: error instanceof Error ? error.message : "Analysis failed" },
        });
        throw error;
      }
    } catch (error) {
      console.error("Analysis service error:", error);
      throw error;
    }
  }

  async getAnalysisHistory(userId: string) {
    return await storage.getPricingAnalysesByUser(userId);
  }

  async getAnalysis(id: string) {
    return await storage.getPricingAnalysis(id);
  }
}

export const analysisService = new AnalysisService();
