import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { connectDB } from "./db";

const app = express();
const httpServer = createServer(app);

/**
 * 🔥 CORS CONFIG (Fixes frontend 5173 → backend 5000 errors)
 * NO wildcard "*" in app.options (prevents path-to-regexp crash)
 */
const allowedOrigins = [
  "http://localhost:5173",
  "https://incomparable-yeot-ec5612.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Proper preflight handler (SAFE — no "*" crash)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging helper (clean production style)
export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [${source}] ${message}`);
}

// API request logger (only logs /api routes)
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  try {
    // 🔥 Connect Database First
    await connectDB();
    log("MongoDB connected successfully", "db");

    // 🔥 Register ALL API routes (/api/monitor/*)
    await registerRoutes(httpServer, app);

    /**
     * ❗ VERY IMPORTANT:
     * API 404 handler that returns JSON (NOT HTML)
     * Prevents "Unexpected token <!doctype" error
     */
    app.use("/api", (req: Request, res: Response) => {
      res.status(404).json({
        message: "API route not found",
        path: req.originalUrl,
      });
    });

    // Global error handler (always JSON)
    app.use(
      (err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error("Internal Server Error:", err);

        res.status(err?.status || 500).json({
          message: err?.message || "Internal Server Error",
        });
      }
    );

    const port = parseInt(process.env.PORT || "5000", 10);

    httpServer.listen(port, "0.0.0.0", () => {
      log(`API server running on port ${port}`, "server");
      log(`CORS enabled for http://localhost:5173`, "server");
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
})();