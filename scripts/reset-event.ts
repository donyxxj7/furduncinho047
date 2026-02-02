import "dotenv/config";
import * as schema from "../src/db/schema";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";

// Os Sócios (Admins) que serão recriados
const ADMINS = [
  { name: "Gaba", email: "gaba@furduncinho.com" },
  { name: "Vt", email: "vt@furduncinho.com" },
  { name: "Ruan", email: "ruan@furduncinho.com" },
  { name: "Rosario", email: "rosario@furduncinho.com" },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Sem DATABASE_URL no .env");

  console.log("🔥 INICIANDO LIMPEZA GERAL DO BANCO...");

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
  });

  const db = drizzle(connection, { schema, mode: "default" });

  // 1. APAGAR DADOS (A ordem importa por causa das chaves estrangeiras)
  console.log("🗑️  Deletando Logs de Check-in...");
  await db.delete(schema.checkinLogs);

  console.log("🗑️  Deletando Pagamentos...");
  await db.delete(schema.payments);

  console.log("🗑️  Deletando Ingressos...");
  await db.delete(schema.tickets);

  console.log("🗑️  Deletando TODOS os Usuários...");
  await db.delete(schema.users);

  // 2. RECRIAR ADMINS
  console.log("✨ Recriando a Diretoria (Admins)...");
  const passwordHash = await bcrypt.hash("123456", 10);

  for (const admin of ADMINS) {
    const fakeOpenId = `admin_${admin.name.toLowerCase()}`;
    await db.insert(schema.users).values({
      name: admin.name,
      email: admin.email,
      passwordHash: passwordHash,
      loginMethod: "local",
      openId: fakeOpenId,
      role: "admin",
    });
    console.log(`   ✅ ${admin.name} restaurado.`);
  }

  console.log("\n🏁 BANCO ZERADO E PRONTO PARA 2026!");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
