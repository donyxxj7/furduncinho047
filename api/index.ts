import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers.ts";
// Verifique se a pasta se chama _core ou __core (com um ou dois underlines)
import { createContext } from "../server/_core/context.ts";
process.env.NODE_ENV = "production";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://furduncinho047.vercel.app",
      "https://app-furduncinho-oficial.vercel.app",
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

export default app;

// Build fix: forcing update to _core 01
