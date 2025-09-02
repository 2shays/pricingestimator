import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analysisService } from "./services/analysis";
import { insertCompanySchema, insertPricingAnalysisSchema } from "@shared/schema";
import { z } from "zod";

const runAnalysisSchema = z.object({
  companyName: z.string().min(1),
  analysisDepth: z.enum(["standard", "deep", "competitive"]).default("standard"),
  targetMarket: z.enum(["enterprise", "mid-market", "smb", "startup"]).default("enterprise"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Companies endpoints
  app.get("/api/companies/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      
      const companies = await storage.searchCompanies(query);
      res.json(companies);
    } catch (error) {
      console.error("Company search error:", error);
      res.status(500).json({ error: "Failed to search companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ error: "Failed to get company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Create company error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid company data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  // Pricing analysis endpoints
  app.post("/api/analysis/run", async (req, res) => {
    try {
      const analysisData = runAnalysisSchema.parse(req.body);
      
      // For demo purposes, we'll use a default user ID
      // In production, this would come from authentication
      const userId = req.headers["x-user-id"] as string || "demo-user";
      
      const analysis = await analysisService.runAnalysis({
        ...analysisData,
        userId,
      });

      res.json(analysis);
    } catch (error) {
      console.error("Run analysis error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid analysis request", details: error.errors });
      }
      res.status(500).json({ error: "Failed to run analysis" });
    }
  });

  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const analysis = await analysisService.getAnalysis(req.params.id);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ error: "Failed to get analysis" });
    }
  });

  app.get("/api/analysis/history/:userId", async (req, res) => {
    try {
      const analyses = await analysisService.getAnalysisHistory(req.params.userId);
      res.json(analyses);
    } catch (error) {
      console.error("Get analysis history error:", error);
      res.status(500).json({ error: "Failed to get analysis history" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
