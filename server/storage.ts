// In-memory storage (removes Postgres/Drizzle dependency)

import type { InsertSite, MonitoredSite, ChangeHistory } from "@shared/schema";

let siteIdCounter = 1;
let historyIdCounter = 1;

export interface IStorage {
  getSites(): Promise<MonitoredSite[]>;
  getSite(id: number): Promise<MonitoredSite | undefined>;
  createSite(site: InsertSite): Promise<MonitoredSite>;
  updateSite(id: number, updates: Partial<MonitoredSite>): Promise<MonitoredSite>;
  deleteSite(id: number): Promise<void>;
  getChangeHistory(siteId: number): Promise<ChangeHistory[]>;
  addChangeRecord(record: {
    siteId: number;
    changeDetected: boolean;
    previousSnapshot?: string;
    currentSnapshot?: string;
  }): Promise<ChangeHistory>;
}

class MemoryStorage implements IStorage {
  private sites: MonitoredSite[] = [];
  private history: ChangeHistory[] = [];

  async getSites(): Promise<MonitoredSite[]> {
    return [...this.sites].sort(
      (a, b) =>
        new Date(b.createdAt as any).getTime() -
        new Date(a.createdAt as any).getTime()
    );
  }

  async getSite(id: number): Promise<MonitoredSite | undefined> {
    return this.sites.find((s) => s.id === id);
  }

  async createSite(site: InsertSite): Promise<MonitoredSite> {
    const newSite: MonitoredSite = {
      id: siteIdCounter++,
      url: site.url,
      createdAt: new Date(),
      lastSnapshot: null,
      lastCheckedAt: null,
      status: "active",
    } as MonitoredSite;

    this.sites.push(newSite);
    return newSite;
  }

  async updateSite(
    id: number,
    updates: Partial<MonitoredSite>
  ): Promise<MonitoredSite> {
    const index = this.sites.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error("Site not found");
    }

    this.sites[index] = {
      ...this.sites[index],
      ...updates,
    };

    return this.sites[index];
  }

  async deleteSite(id: number): Promise<void> {
    this.sites = this.sites.filter((s) => s.id !== id);
    this.history = this.history.filter((h) => h.siteId !== id);
  }

  async getChangeHistory(siteId: number): Promise<ChangeHistory[]> {
    return this.history
      .filter((h) => h.siteId === siteId)
      .sort(
        (a, b) =>
          new Date(b.timestamp as any).getTime() -
          new Date(a.timestamp as any).getTime()
      );
  }

  async addChangeRecord(record: {
    siteId: number;
    changeDetected: boolean;
    previousSnapshot?: string;
    currentSnapshot?: string;
  }): Promise<ChangeHistory> {
    const newRecord: ChangeHistory = {
      id: historyIdCounter++,
      siteId: record.siteId,
      changeDetected: record.changeDetected,
      previousSnapshot: record.previousSnapshot || null,
      currentSnapshot: record.currentSnapshot || null,
      timestamp: new Date(),
    } as ChangeHistory;

    this.history.push(newRecord);
    return newRecord;
  }
}

export const storage = new MemoryStorage();