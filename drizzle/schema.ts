import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  // --- CAMPO RECOLOCADO ---
  passwordHash: text("passwordHash"),
  // ------------------------
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

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

export const checkinLogs = mysqlTable("checkinLogs", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  adminId: int("adminId").notNull(),
  result: mysqlEnum("result", ["valid", "invalid", "used"]).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type CheckinLog = typeof checkinLogs.$inferSelect;
export type InsertCheckinLog = typeof checkinLogs.$inferInsert;
