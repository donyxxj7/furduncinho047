import { getDb } from "./server/db";
import { users } from "./src/db/schema";
import bcrypt from "bcrypt";
import "dotenv/config";

const ADMIN_PASSWORD = "furduncinho2026";

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
];

async function seedAdmins() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Erro ao conectar ao banco de dados Neon.");
    return;
  }

  console.log("🚀 Iniciando a criação/atualização de administradores...");

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  for (const email of ADMIN_EMAILS) {
    try {
      // Extrai o nome do email (ex: 'gaba' de 'gaba@furduncinho.com')
      const name =
        email.split("@")[0].charAt(0).toUpperCase() +
        email.split("@")[0].slice(1);

      await db
        .insert(users)
        .values({
          name: name,
          email: email,
          passwordHash,
          role: "admin",
          loginMethod: "local",
          openid: `admin_local_${email.split("@")[0]}`,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            role: "admin",
            passwordHash: passwordHash,
            name: name,
          },
        });
      console.log(`✅ ${email} configurado como Admin.`);
    } catch (err) {
      console.error(`❌ Erro ao processar ${email}:`, err);
    }
  }

  console.log("\n🎉 Todos os administradores foram processados com sucesso!");
  process.exit(0);
}

seedAdmins();
