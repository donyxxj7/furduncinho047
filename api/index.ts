import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// ⚠️ IMPORTANTE: sem ".js" aqui
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://furduncinho047.vercel.app",
      "https://app-furduncinho-oficial.vercel.app",
      "https://furduncinho047-2026.vercel.app",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// ✅ handler compatível com Serverless (Vercel chama (req,res))
export default function handler(req: any, res: any) {
  return app(req, res);
}
