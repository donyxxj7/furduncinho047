import { type CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { getDb } from "../db";
import jwt from "jsonwebtoken";
// --- CORREÇÃO AQUI: Voltamos DUAS pastas (../..) para achar o drizzle na raiz ---
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function getUserFromHeader(req: CreateExpressContextOptions["req"]) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    if (!process.env.JWT_SECRET) return null;

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) return null;

    const db = await getDb();

    // Verificação de segurança
    if (!db) return null;

    // Busca o usuário
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    return result[0] || null;
  } catch (err) {
    return null;
  }
}

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  const db = await getDb();
  const user = await getUserFromHeader(req);

  return {
    req,
    res,
    db,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
