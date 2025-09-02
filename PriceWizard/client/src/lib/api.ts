import { apiRequest } from "./queryClient";

export interface AnalysisRequest {
  companyName: string;
  analysisDepth: "standard" | "deep" | "competitive";
  targetMarket: "enterprise" | "mid-market" | "smb" | "startup";
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  logoUrl?: string;
}

export interface PricingAnalysis {
  id: string;
  companyId: string;
  analysisResults: any;
  recommendedPrice?: string;
  confidenceScore?: number;
  status: string;
  createdAt: string;
}

export const api = {
  // Company endpoints
  searchCompanies: async (query: string): Promise<Company[]> => {
    const response = await apiRequest("GET", `/api/companies/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  getCompany: async (id: string): Promise<Company> => {
    const response = await apiRequest("GET", `/api/companies/${id}`);
    return response.json();
  },

  // Analysis endpoints
  runAnalysis: async (request: AnalysisRequest): Promise<PricingAnalysis> => {
    const response = await apiRequest("POST", "/api/analysis/run", request);
    return response.json();
  },

  getAnalysis: async (id: string): Promise<PricingAnalysis> => {
    const response = await apiRequest("GET", `/api/analysis/${id}`);
    return response.json();
  },

  getAnalysisHistory: async (userId: string): Promise<PricingAnalysis[]> => {
    const response = await apiRequest("GET", `/api/analysis/history/${userId}`);
    return response.json();
  },
};
