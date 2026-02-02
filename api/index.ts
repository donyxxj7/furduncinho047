import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
// CORREÇÃO: Importando do caminho correto baseado no seu index.ts
import { createContext } from "../server/_core/context";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://app-furduncinho-oficial.vercel.app",
      // Adicione a URL que a Vercel te deu aqui embaixo:
      "https://furduncinho047.vercel.app",
      "https://furduncinho047-2026.vercel.app/",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

// Rota oficial do tRPC para o seu frontend encontrar os dados
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
