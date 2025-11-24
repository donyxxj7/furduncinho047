import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),

  // O openId agora é opcional, já que usuários locais não terão um.
  openId: varchar("openId", { length: 64 }).unique(),

  name: text("name"),

  // Email agora é obrigatório (notNull) e único (unique) para o login
  // Mudei para varchar(191) que é o tamanho padrão para chaves únicas em MySQL antigo
  email: varchar("email", { length: 191 }).notNull().unique(),

  phone: varchar("phone", { length: 20 }),

  // --- CAMPO ADICIONADO ---
  // Vamos salvar a senha criptografada aqui
  passwordHash: text("passwordHash"),
  // ------------------------

  // loginMethod agora é opcional
  loginMethod: varchar("loginMethod", { length: 64 }),

  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tickets table - stores ticket information
 */
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "cancelled", "used"])
    .default("pending")
    .notNull(),
  qrCodeHash: varchar("qrCodeHash", { length: 255 }),
  qrImagePath: text("qrImagePath"),
  ticketCode: varchar("ticketCode", { length: 50 }),
  ticketImagePath: text("ticketImagePath"),
  generatedAt: timestamp("generatedAt"),
  validatedAt: timestamp("validatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Payments table - stores payment information and proof
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  comprovantePath: text("comprovantePath"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"])
    .default("pending")
    .notNull(),
  approvedBy: int("approvedBy"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Check-in logs table - stores all check-in attempts
 */
export const checkinLogs = mysqlTable("checkinLogs", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  adminId: int("adminId").notNull(),
  result: mysqlEnum("result", ["valid", "invalid", "used"]).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
});

export type CheckinLog = typeof checkinLogs.$inferSelect;
export type InsertCheckinLog = typeof checkinLogs.$inferInsert;
