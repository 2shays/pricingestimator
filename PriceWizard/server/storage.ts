import { 
  users, companies, pricingTiers, pricingAnalyses,
  type User, type InsertUser, type Company, type InsertCompany,
  type PricingTier, type InsertPricingTier, type PricingAnalysis, type InsertPricingAnalysis
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByName(name: string): Promise<Company | undefined>;
  searchCompanies(query: string): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company | undefined>;

  // Pricing Tiers
  getPricingTiers(companyId: string): Promise<PricingTier[]>;
  createPricingTier(tier: InsertPricingTier): Promise<PricingTier>;

  // Pricing Analyses
  getPricingAnalysis(id: string): Promise<PricingAnalysis | undefined>;
  getPricingAnalysesByUser(userId: string): Promise<PricingAnalysis[]>;
  createPricingAnalysis(analysis: InsertPricingAnalysis): Promise<PricingAnalysis>;
  updatePricingAnalysis(id: string, updates: Partial<InsertPricingAnalysis>): Promise<PricingAnalysis | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanyByName(name: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(ilike(companies.name, name));
    return company || undefined;
  }

  async searchCompanies(query: string): Promise<Company[]> {
    return await db.select().from(companies)
      .where(ilike(companies.name, `%${query}%`))
      .limit(10);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db.update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }

  async getPricingTiers(companyId: string): Promise<PricingTier[]> {
    return await db.select().from(pricingTiers)
      .where(eq(pricingTiers.companyId, companyId));
  }

  async createPricingTier(insertTier: InsertPricingTier): Promise<PricingTier> {
    const [tier] = await db.insert(pricingTiers).values(insertTier).returning();
    return tier;
  }

  async getPricingAnalysis(id: string): Promise<PricingAnalysis | undefined> {
    const [analysis] = await db.select().from(pricingAnalyses).where(eq(pricingAnalyses.id, id));
    return analysis || undefined;
  }

  async getPricingAnalysesByUser(userId: string): Promise<PricingAnalysis[]> {
    return await db.select().from(pricingAnalyses)
      .where(eq(pricingAnalyses.userId, userId))
      .orderBy(desc(pricingAnalyses.createdAt))
      .limit(20);
  }

  async createPricingAnalysis(insertAnalysis: InsertPricingAnalysis): Promise<PricingAnalysis> {
    const [analysis] = await db.insert(pricingAnalyses).values(insertAnalysis).returning();
    return analysis;
  }

  async updatePricingAnalysis(id: string, updates: Partial<InsertPricingAnalysis>): Promise<PricingAnalysis | undefined> {
    const [analysis] = await db.update(pricingAnalyses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pricingAnalyses.id, id))
      .returning();
    return analysis || undefined;
  }
}

export const storage = new DatabaseStorage();
