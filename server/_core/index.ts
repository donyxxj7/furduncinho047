import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import * as db from "../db";
import { sql } from "drizzle-orm";

// ------------------ KEEP ALIVE ------------------------

const MY_RENDER_URL =
  process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";

// ------------------------------------------------------

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ---------------- HEALTH ROUTE (CORRIGIDO) -----------------

function setupHealthRoute(app: express.Express) {
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ ok: true });
  });
}

// ------------------------------------------------------------

function startKeepAlive() {
  const INTERVAL_MS = 14 * 60 * 1000;

  setInterval(async () => {
    try {
      const database = await db.getDb();
      if (database) {
        await database.execute(sql`SELECT 1`);
      }
    } catch (error) {
      console.error("❌ [KeepAlive] DB Ping Error:", error);
    }

    if (process.env.RENDER_EXTERNAL_URL) {
      try {
        const response = await fetch(`${MY_RENDER_URL}/health`);
        console.log(`KeepAlive -> ${response.status}`);
      } catch (error) {
        console.error("❌ [KeepAlive] HTTP Ping Error:", error);
      }
    }
  }, INTERVAL_MS);
}

// ------------------------------------------------------------

async function startServer() {
  const app = express();
  const server = createServer(app);

  // --------------- CORS CORRIGIDO -------------------

  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://app-furduncinho-oficial.vercel.app", // dominio da vercel
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Evita erro 405 nas preflight OPTIONS
  app.options("*", cors());

  // -----------------------------------------------------

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  setupHealthRoute(app);

  registerOAuthRoutes(app);

  // --------------- tRPC -------------------------------

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // -----------------------------------------------------

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    startKeepAlive();
  });
}

startServer().catch(console.error);
