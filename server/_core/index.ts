import "dotenv/config";
import express from "express";
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
// O Render fornece a URL automaticamente na variável RENDER_EXTERNAL_URL
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
  // Roda a cada 14 minutos (Render dorme em 15min)
  const INTERVAL_MS = 14 * 60 * 1000;

  setInterval(async () => {
    // 1. Ping no Banco de Dados (Para o TiDB não dormir)
    try {
      const database = await db.getDb();
      if (database) {
        await database.execute(sql`SELECT 1`);
        // console.log("✅ [KeepAlive] Banco de dados pingado.");
      }
    } catch (error) {
      console.error("❌ [KeepAlive] Erro ao pingar banco:", error);
    }

    // 2. Ping no Servidor Web (Para o Render não dormir)
    // Só faz sentido se estivermos em produção no Render
    if (process.env.RENDER_EXTERNAL_URL) {
      try {
        // Acessa a rota de "me" (leve) para acordar a API
        console.log(`⏰ [KeepAlive] Pingando ${MY_RENDER_URL}...`);
        const response = await fetch(`${MY_RENDER_URL}/api/trpc/auth.me`);
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

    // Inicia o sistema anti-sono
    console.log("☕ Sistema Anti-Sleep (DB + HTTP): ATIVADO");
    startKeepAlive();
  });
}

startServer().catch(console.error);
