import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import {
  InsertUser,
  users,
  tickets,
  payments,
  checkinLogs,
  InsertTicket,
  InsertPayment,
  InsertCheckinLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      if (!_pool) {
        _pool = mysql.createPool(process.env.DATABASE_URL);
      }

      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      email: user.email,
      openId: user.openId ?? null,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.email) {
      updateSet.email = user.email;
    }
    if (user.name) {
      updateSet.name = user.name;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    // --- CORREÇÃO DA LÓGICA DE ADMIN ---
    // --- CORREÇÃO DA LÓGICA DE ADMIN ---
    // 1. Define o role padrão baseado no que está no banco
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    // 2. VERIFICA SEPARADAMENTE a promoção (isto vai sobrescrever o 'user' se bater)
    if (user.openId && user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    // --- FIM DA CORREÇÃO ---
    // --- FIM DA CORREÇÃO ---

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by email: database not available");
    return undefined;
  }
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by id: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Ticket queries
export async function createTicket(ticket: InsertTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tickets).values(ticket);
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
  return result.length > 0 ? result[0] : undefined;
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
  return result.length > 0 ? result[0] : undefined;
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

// Payment queries
export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(payment);
  return result;
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
  return result.length > 0 ? result[0] : undefined;
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

// Check-in log queries
export async function createCheckinLog(log: InsertCheckinLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(checkinLogs).values(log);
  return result;
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
