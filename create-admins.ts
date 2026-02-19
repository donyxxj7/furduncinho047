import "dotenv/config";
import { getDb } from "./server/db";
import { users } from "./src/db/schema";
import bcrypt from "bcrypt";

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

const ADMIN_PASSWORD = "furduncinho2026";

async function createAllAdmins() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Erro: Não foi possível conectar ao banco de dados.");
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  console.log("🚀 Iniciando criação de administradores com CPFs únicos...");

  // Usamos o index (i) para criar um CPF diferente para cada um
  for (let i = 0; i < ADMIN_EMAILS.length; i++) {
    const email = ADMIN_EMAILS[i];
    try {
      const name = email.split("@")[0].toUpperCase();
      // Gera um CPF tipo 00000000000, 00000000001, etc.
      const uniqueCpf = i.toString().padStart(11, "0");

      await db.insert(users).values({
        name: name,
        email: email,
        cpf: uniqueCpf,
        passwordHash: passwordHash,
        role: "admin",
        loginMethod: "local",
        openid: `admin_${name.toLowerCase()}_${Date.now()}`,
      });

      console.log(`✅ Admin criado: ${email} (CPF: ${uniqueCpf})`);
    } catch (error: any) {
      if (error.code === "23505") {
        console.warn(`⚠️ Aviso: O admin ${email} ou o CPF já existe.`);
      } else {
        console.error(`❌ Erro ao criar ${email}:`, error.message);
      }
    }
  }

  console.log(
    "\n✨ Processo finalizado! Agora o Sutter e o Rodário podem logar."
  );
  process.exit(0);
}

createAllAdmins();
