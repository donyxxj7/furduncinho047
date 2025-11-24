import mysql from "mysql2/promise";

// O ID da sua conta ADMIN, de acordo com a imagem
const ADMIN_ID = 150003;

async function deleteTestUsers() {
  console.log("Conectando ao TiDB Cloud para deletar usuários...");

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "gateway02.us-east-1.prod.aws.tidbcloud.com",
      port: 4000,
      user: "228TB7rmHcwk69v.root",
      password: "lyOk7e704X3c1EdzUpUv",
      database: "furduncinho047",
      ssl: {
        rejectUnauthorized: true,
      },
    });

    console.log("Conectado! Deletando todas as contas (exceto o admin)...");

    // --- CORREÇÃO ---
    // Agora vamos deletar usando o 'id' em vez do 'openId'
    // Isso vai funcionar 100%
    const [result] = await connection.query(
      "DELETE FROM users WHERE id != ?;",
      [ADMIN_ID]
    );
    // --- FIM DA CORREÇÃO ---

    console.log("✅ Sucesso! Limpeza concluída.");
    console.log(result); // Isso deve mostrar 'affectedRows: 1'

    await connection.end();
  } catch (err) {
    console.error("❌ Erro ao tentar deletar usuários:");
    console.error(err);
    process.exit(1);
  }
}

deleteTestUsers();
