import postgres from "postgres";
import "dotenv/config";

// O ID da sua conta ADMIN no Neon (Verifique no Drizzle Studio se o ID mudou)
const ADMIN_ID = 1;

async function deleteTestUsers() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ Erro: DATABASE_URL não encontrada no arquivo .env");
    return;
  }

  console.log("Conectando ao Neon para limpar usuários...");

  // Criamos a conexão usando o driver de Postgres
  const sql = postgres(databaseUrl, { ssl: "require" });

  try {
    console.log(`Conectado! Deletando usuários (exceto ID: ${ADMIN_ID})...`);

    // No Postgres a query de deleção é igual, mas o retorno do driver muda
    const result = await sql`
      DELETE FROM users 
      WHERE id != ${ADMIN_ID}
    `;

    console.log("✅ Sucesso! Limpeza concluída.");
    console.log(`Linhas afetadas: ${result.count}`);
  } catch (err) {
    console.error("❌ Erro ao tentar deletar usuários:");
    console.error(err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

deleteTestUsers();
