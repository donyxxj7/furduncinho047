import "dotenv/config";
import express from "express";
import cors from "cors"; // <--- IMPORTANTE: Adicionado
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import * as db from "../db";
import { sql } from "drizzle-orm";

// --- CONFIGURAÇÃO DO AUTO-PING ---
const MY_RENDER_URL =
  process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
// ---------------------------------

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

// --- FUNÇÃO KEEP-ALIVE DUPLA (Banco + Servidor) ---
function startKeepAlive() {
  const INTERVAL_MS = 14 * 60 * 1000; // 14 minutos

  setInterval(async () => {
    // 1. Ping no Banco de Dados
    try {
      const database = await db.getDb();
      if (database) {
        await database.execute(sql`SELECT 1`);
        // console.log("✅ [KeepAlive] Banco de dados pingado.");
      }
    } catch (error) {
      console.error("❌ [KeepAlive] Erro ao pingar banco:", error);
    }

    // 2. Ping no Servidor Web (Auto-Ping)
    if (process.env.RENDER_EXTERNAL_URL) {
      try {
        console.log(`⏰ [KeepAlive] Pingando ${MY_RENDER_URL}...`);
        const response = await fetch(`${MY_RENDER_URL}/api/trpc/system.health`); // Rota leve de health check
        console.log(`✅ [KeepAlive] Status do Ping: ${response.status}`);
      } catch (error) {
        console.error("❌ [KeepAlive] Erro no Self-Ping:", error);
      }
    }
  }, INTERVAL_MS);
}
// -------------------------------------------

async function startServer() {
  const app = express();
  const server = createServer(app);

  // --- CONFIGURAÇÃO DO CORS (Obrigatório para Vercel) ---
  app.use(
    cors({
      origin: [
        "http://localhost:5173", // Frontend local
        "http://localhost:3000", // Backend local
        "https://furduncinho047.vercel.app", // SEU SITE NA VERCEL
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  // ----------------------------------------------------

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log("☕ Sistema Anti-Sleep (DB + HTTP): ATIVADO");
    console.log("🔓 CORS habilitado para Vercel e Localhost");
    startKeepAlive();
  });
}

startServer().catch(console.error);
