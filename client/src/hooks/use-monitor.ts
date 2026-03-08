import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type SiteInput } from "@shared/routes";

// 🔥 DIRECT BACKEND URL (NO PROXY, NO REPLIT, NO 404)
// const API_BASE = import.meta.env.VITE_API_URL;
const API_BASE = "https://tiny-fish-hackathon-production.up.railway.app";
// Safe JSON parser to prevent "Unexpected token <" crash
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("❌ Non-JSON response from server:", text);
    throw new Error("Server returned HTML instead of JSON (API misconfigured)");
  }
}

export function useSites() {
  return useQuery({
    queryKey: [api.sites.list.path],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}${api.sites.list.path}`);
      if (!res.ok) throw new Error("Failed to fetch monitored sites");
      return await safeJson(res);
    },
  });
}

export function useSiteHistory(siteId: number) {
  return useQuery({
    queryKey: [api.sites.history.path, siteId],
    queryFn: async () => {
      const url = `${API_BASE}${buildUrl(api.sites.history.path, { id: siteId })}`;
      const res = await fetch(url);
      if (res.status === 404) return [];
      if (!res.ok) throw new Error("Failed to fetch site history");
      return await safeJson(res);
    },
    enabled: !!siteId,
  });
}

export function useAddSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SiteInput) => {
      const validated = api.sites.add.input.parse(data);

      const res = await fetch(`${API_BASE}${api.sites.add.path}`, {
        method: api.sites.add.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      const responseData = await safeJson(res);

      if (!res.ok) {
        throw new Error(responseData?.message || "Failed to add site");
      }

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.list.path] });
    },
  });
}

export function useRunCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId?: number) => {
      const body = siteId ? { id: siteId } : {};

      const res = await fetch(`${API_BASE}${api.sites.check.path}`, {
        method: api.sites.check.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await safeJson(res);

      if (!res.ok) throw new Error(data?.message || "Check failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.sites.history.path] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = `${API_BASE}${buildUrl(api.sites.delete.path, { id })}`;
      const res = await fetch(url, {
        method: api.sites.delete.method,
      });

      if (!res.ok && res.status !== 404) {
        const data = await safeJson(res);
        throw new Error(data?.message || "Failed to delete site");
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.list.path] });
    },
  });
}