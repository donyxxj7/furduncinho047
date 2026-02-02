import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { ENV } from "./_core/env";

// Extraímos as tabelas do schema para uso nas queries
const { users, tickets, payments, checkinLogs } = schema;

// Tipos inferidos para inserção
export type InsertUser = typeof users.$inferInsert;
export type InsertTicket = typeof tickets.$inferInsert;
export type InsertPayment = typeof payments.$inferInsert;
export type InsertCheckinLog = typeof checkinLogs.$inferInsert;

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _client: postgres.Sql | null = null;

/**
 * Inicializa e retorna a instância do banco de dados Drizzle (PostgreSQL)
 */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      if (!_client) {
        // 'prepare: false' é necessário para o Neon funcionar corretamente com o Pooler
        _client = postgres(process.env.DATABASE_URL, { prepare: false });
      }
      _db = drizzle(_client, { schema });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// --- FUNÇÕES DE USUÁRIO ---

// Lista dos novos administradores
const ADMIN_EMAILS = [
  "admin@furduncinho.com",
  "gaba@furduncinho.com",
  "vt@furduncinho.com",
  "ruan@furduncinho.com",
  "rosario@furduncinho.com",
  "miorim@furduncinho.com",
  "endony@furduncinho.com",
  "sutter@furduncinho.com",
  "barcelos@furduncinho.com",
  // Adicione o seu e-mail pessoal aqui também se necessário
];

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.email) throw new Error("User email is required for upsert");
  const db = await getDb();
  if (!db) return;

  // Verifica se o usuário logado está na lista de admins ou é o dono
  const isAdmin =
    ADMIN_EMAILS.includes(user.email.toLowerCase()) ||
    user.openid === ENV.ownerOpenId;

  try {
    await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: user.name,
          phone: user.phone,
          lastSignedIn: new Date(),
          role: isAdmin ? "admin" : "user", // Atribui admin se estiver na lista
        },
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openid, openId))
    .limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// --- TICKET QUERIES ---

// No seu arquivo server/db.ts, ajuste a função de criar ingresso:
export async function createTicket(data: {
  userId: number;
  status: string;
  hasCooler: boolean; // Novo parâmetro
  amount: number; // Novo parâmetro
}) {
  const database = await getDb();
  if (!database) return null;

  // Insere o ingresso com as novas informações de cooler e valor
  const result = await database
    .insert(tickets)
    .values({
      userId: data.userId,
      status: data.status as any,
      hasCooler: data.hasCooler,
      amount: data.amount,
    })
    .returning({ insertedId: tickets.id });

  return result;
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, id))
    .limit(1);
  return result[0];
}

export async function getTicketsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tickets)
    .where(eq(tickets.userId, userId))
    .orderBy(desc(tickets.createdAt));
}

export async function getTicketByQrHash(qrCodeHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tickets)
    .where(eq(tickets.qrCodeHash, qrCodeHash))
    .limit(1);
  return result[0];
}

export async function updateTicket(id: number, data: Partial<InsertTicket>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tickets).set(data).where(eq(tickets.id, id));
}

export async function getAllTickets() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
}

// --- PAYMENT QUERIES ---

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(payments).values(payment);
}

export async function getPaymentByTicketId(ticketId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.ticketId, ticketId))
    .orderBy(desc(payments.createdAt))
    .limit(1);
  return result[0];
}

export async function getPendingPayments() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(payments)
    .where(eq(payments.status, "pending"))
    .orderBy(desc(payments.createdAt));
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payments).set(data).where(eq(payments.id, id));
}

// --- CHECK-IN LOG QUERIES ---

export async function createCheckinLog(log: InsertCheckinLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(checkinLogs).values(log);
}

export async function getCheckinLogs() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(checkinLogs)
    .orderBy(desc(checkinLogs.timestamp));
}

export async function getCheckinLogsByTicketId(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(checkinLogs)
    .where(eq(checkinLogs.ticketId, ticketId))
    .orderBy(desc(checkinLogs.timestamp));
}
