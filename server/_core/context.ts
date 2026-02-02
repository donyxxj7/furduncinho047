import { type CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { getDb } from "../db.js";
import { users } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { sdk } from "./sdk.js"; // Importamos o seu SDK que já lida com o JWT
import { COOKIE_NAME } from "@shared/const";

async function getUserFromCookie(req: CreateExpressContextOptions["req"]) {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return null;

    const payload = await sdk.verifySession(token);

    // CORREÇÃO 1: Verifica se o payload existe para evitar o erro 'possivelmente null'
    if (!payload) return null;

    // CORREÇÃO 2: Usa o 'as any' para ler o openid minúsculo sem o TS reclamar
    // Tentamos ler o minúsculo primeiro, se não existir, pegamos o CamelCase
    const userOpenId = (payload as any).openid || payload.openId;

    if (!userOpenId) return null;

    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(users)
      .where(eq(users.openid, userOpenId))
      .limit(1);

    return result[0] || null;
  } catch (err) {
    console.error("Erro no contexto de auth:", err);
    return null;
  }
}

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  const db = await getDb();
  const user = await getUserFromCookie(req);

  return {
    req,
    res,
    db,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
