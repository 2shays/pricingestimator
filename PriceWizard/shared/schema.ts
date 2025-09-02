import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, decimal, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  industry: text("industry"),
  size: text("size"),
  revenue: text("revenue"),
  website: text("website"),
  logoUrl: text("logo_url"),
  qualitative: text("qualitative"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pricingTiers = pgTable("pricing_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  features: text("features").notNull(),
  targetMarket: text("target_market"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pricingAnalyses = pgTable("pricing_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  userId: varchar("user_id").references(() => users.id),
  analysisResults: jsonb("analysis_results").notNull(),
  confidenceScore: integer("confidence_score"),
  recommendedPrice: text("recommended_price"),
  status: text("status").notNull().default("pending"),
  analysisDepth: text("analysis_depth").notNull().default("standard"),
  targetMarket: text("target_market").notNull().default("enterprise"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  pricingTiers: many(pricingTiers),
  analyses: many(pricingAnalyses),
}));

export const pricingTiersRelations = relations(pricingTiers, ({ one }) => ({
  company: one(companies, {
    fields: [pricingTiers.companyId],
    references: [companies.id],
  }),
}));

export const pricingAnalysesRelations = relations(pricingAnalyses, ({ one }) => ({
  company: one(companies, {
    fields: [pricingAnalyses.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [pricingAnalyses.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPricingTierSchema = createInsertSchema(pricingTiers).omit({
  id: true,
  createdAt: true,
});

export const insertPricingAnalysisSchema = createInsertSchema(pricingAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertPricingTier = z.infer<typeof insertPricingTierSchema>;
export type PricingTier = typeof pricingTiers.$inferSelect;
export type InsertPricingAnalysis = z.infer<typeof insertPricingAnalysisSchema>;
export type PricingAnalysis = typeof pricingAnalyses.$inferSelect;
