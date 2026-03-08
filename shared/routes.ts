import { z } from 'zod';
import { insertSiteSchema, monitoredSites, changeHistory } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  sites: {
    // GET all monitored sites (Dashboard)
    list: {
      method: 'GET' as const,
      path: '/api/monitor/list' as const,
      responses: {
        200: z.array(z.custom<typeof monitoredSites.$inferSelect>()),
      },
    },

    // ADD new site (FIXES 404 + JSON error)
    add: {
      method: 'POST' as const,
      path: '/api/monitor/add' as const,
      input: insertSiteSchema,
      responses: {
        201: z.custom<typeof monitoredSites.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal || z.object({ message: z.string() }),
      },
    },

    // RUN agent check (manual or single site)
    check: {
      method: 'POST' as const,
      path: '/api/monitor/check' as const,
      input: z.object({ id: z.number().optional() }).optional(),
      responses: {
        200: z.object({
          message: z.string(),
          changesDetected: z.number(),
        }),
        400: errorSchemas.validation,
        500: z.object({ message: z.string() }),
      },
    },

    // GET history for a specific site
    history: {
      method: 'GET' as const,
      path: '/api/monitor/:id/history' as const,
      responses: {
        200: z.array(z.custom<typeof changeHistory.$inferSelect>()),
        404: errorSchemas.notFound,
        500: z.object({ message: z.string() }),
      },
    },

    // DELETE a monitored site (IMPORTANT: frontend expects JSON-safe response)
    delete: {
      method: 'DELETE' as const,
      path: '/api/monitor/:id' as const,
      // ⚠️ Changed from 204 to 200 to prevent "Unexpected end of JSON input"
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
        500: z.object({ message: z.string() }),
      },
    },
  },
} as const;

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type SiteInput = z.infer<typeof api.sites.add.input>;
