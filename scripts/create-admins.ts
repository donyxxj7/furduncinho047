import "dotenv/config";
import * as schema from "../src/db/schema";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

// Configuração dos Sócios
const ADMINS = [
  { name: "Gaba", email: "gaba@furduncinho.com" },
  { name: "Vt", email: "vt@furduncinho.com" },
  { name: "Ruan", email: "ruan@furduncinho.com" },
  { name: "Rosario", email: "rosario@furduncinho.com" },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não encontrada no .env");
  }

  console.log("🔌 Conectando ao banco de dados...");

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
  });

  const db = drizzle(connection, { schema, mode: "default" });

  console.log("🔒 Gerando senhas...");
  const passwordHash = await bcrypt.hash("123456", 10);

  console.log("🚀 Criando administradores...");

  for (const admin of ADMINS) {
    try {
      const fakeOpenId = `admin_${admin.name.toLowerCase()}`;

      await db.insert(schema.users).values({
        name: admin.name,
        email: admin.email,
        passwordHash: passwordHash,
        loginMethod: "local",
        openId: fakeOpenId,
        role: "admin",
      });

      console.log(`✅ ${admin.name} criado com sucesso!`);
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log(`⚠️  ${admin.name} já existe. Pulando...`);
      } else {
        console.error(`❌ Erro ao criar ${admin.name}:`, error.message);
      }
    }
  }

  console.log("\n🏁 Finalizado! Senha padrão: 123456");
  process.exit(0);
}

main().catch(err => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
