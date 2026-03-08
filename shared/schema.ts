import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const monitoredSites = pgTable("monitored_sites", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  status: text("status").notNull().default("active"), // active, monitoring, updated, error
  lastSnapshot: text("last_snapshot"),
  lastCheckedAt: timestamp("last_checked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const changeHistory = pgTable("change_history", {
  id: serial("id").primaryKey(),
  siteId: serial("site_id").references(() => monitoredSites.id),
  changeDetected: boolean("change_detected").notNull(),
  previousSnapshot: text("previous_snapshot"),
  currentSnapshot: text("current_snapshot"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertSiteSchema = createInsertSchema(monitoredSites).pick({
  url: true,
});

export type InsertSite = z.infer<typeof insertSiteSchema>;
export type MonitoredSite = typeof monitoredSites.$inferSelect;
export type ChangeHistory = typeof changeHistory.$inferSelect;
