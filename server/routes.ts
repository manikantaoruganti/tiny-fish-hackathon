import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { fetchWebSnapshot, detectChanges } from "./agents/webAgent";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // 🟢 GET: List all monitored sites
  app.get("/api/monitor/list", async (_req, res) => {
    try {
      const sites = await storage.getSites();
      res.status(200).json(sites);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // 🟢 POST: Add new site (THIS FIXES YOUR 404)
  app.post("/api/monitor/add", async (req, res) => {
    try {
      const input = api.sites.add.input.parse(req.body);

      let finalUrl = input.url.trim();
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
      }

      // Fetch initial snapshot using agent
      const snapshot = await fetchWebSnapshot(finalUrl);

      if (snapshot.error) {
        return res.status(400).json({
          message: `Could not fetch website: ${snapshot.error}`,
          field: "url",
        });
      }

      const site = await storage.createSite({ url: finalUrl });

      const updatedSite = await storage.updateSite(site.id, {
        lastSnapshot: snapshot.content,
        lastCheckedAt: snapshot.timestamp,
        status: "active",
      });

      return res.status(201).json(updatedSite);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }

      console.error("Add site error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // 🟢 POST: Run agent check
  app.post("/api/monitor/check", async (req, res) => {
    try {
      const siteId = req.body?.id ? Number(req.body.id) : null;
      let sites = await storage.getSites();

      if (siteId) {
        const single = await storage.getSite(siteId);
        if (!single) {
          return res.status(404).json({ message: "Site not found" });
        }
        sites = [single];
      }

      let changesDetected = 0;

      for (const site of sites) {
        await storage.updateSite(site.id, { status: "monitoring" });

        const snapshot = await fetchWebSnapshot(site.url);

        if (snapshot.error) {
          await storage.updateSite(site.id, {
            status: "error",
            lastCheckedAt: new Date(),
          });
          continue;
        }

        const hasChanged = detectChanges(
          site.lastSnapshot || null,
          snapshot.content
        );

        await storage.addChangeRecord({
          siteId: site.id,
          changeDetected: hasChanged,
          previousSnapshot: site.lastSnapshot || "",
          currentSnapshot: snapshot.content,
        });

        await storage.updateSite(site.id, {
          lastSnapshot: snapshot.content,
          lastCheckedAt: snapshot.timestamp,
          status: hasChanged ? "updated" : "active",
        });

        if (hasChanged) changesDetected++;
      }

      res.status(200).json({
        message: `Checked ${sites.length} site(s). ${changesDetected} change(s) detected.`,
        changesDetected,
      });
    } catch (error: any) {
      console.error("Check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // 🟢 GET: History
  app.get("/api/monitor/:id/history", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const site = await storage.getSite(id);

      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }

      const history = await storage.getChangeHistory(id);
      res.status(200).json(history);
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // 🟢 DELETE: Remove site
  app.delete("/api/monitor/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const site = await storage.getSite(id);

      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }

      await storage.deleteSite(id);
      res.status(200).json({ message: "Site deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}