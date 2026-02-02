import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// --- ENUMS ---
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const ticketStatusEnum = pgEnum("status", [
  "pending",
  "paid",
  "cancelled",
  "used",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
  "approved",
  "rejected",
]);

// --- TABELA: USUÁRIOS ---
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openid: varchar("openid", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("passwordHash"),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// --- TABELA: INGRESSOS (TICKETS) ---
export const tickets = pgTable("tickets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId")
    .references(() => users.id)
    .notNull(),
  status: ticketStatusEnum("status").default("pending").notNull(),
  hasCooler: boolean("hasCooler").default(false).notNull(),
  amount: integer("amount").default(3000).notNull(),
  qrCodeHash: varchar("qrCodeHash", { length: 255 }),
  qrImagePath: text("qrImagePath"),
  ticketCode: varchar("ticketCode", { length: 50 }),
  ticketImagePath: text("ticketImagePath"),
  generatedAt: timestamp("generatedAt"),
  validatedAt: timestamp("validatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// --- TABELA: PAGAMENTOS ---
export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ticketId: integer("ticketId")
    .references(() => tickets.id)
    .notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  amount: integer("amount").notNull().default(0),
  externalId: varchar("externalId", { length: 255 }),
  comprovantePath: text("comprovantePath"),
  rejectionReason: text("rejectionReason"),
  approvedBy: integer("approvedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// --- TABELA: LOGS DE ENTRADA (CHECK-IN) ---
export const checkinLogs = pgTable("checkin_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ticketId: integer("ticketId")
    .references(() => tickets.id)
    .notNull(),
  adminId: integer("adminId").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  deviceInfo: text("deviceInfo"),
  result: text("result"),
  notes: text("notes"),
});

// --- TABELA: CONFIGURAÇÕES DO EVENTO (CMS) ---
export const eventSettings = pgTable("event_settings", {
  // Padronizado com generatedAlwaysAsIdentity para evitar erros de push
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventName: text("event_name").notNull().default("Furduncinho 047"),
  eventDate: text("event_date").notNull(), // Formato ISO para o Countdown
  location: text("location").notNull().default("Local do Evento"),
  priceNormal: integer("price_normal").notNull().default(3000),
  priceCooler: integer("price_cooler").notNull().default(7000),
  serviceFee: integer("service_fee").notNull().default(500),
  allowCooler: boolean("allow_cooler").notNull().default(true),
});
