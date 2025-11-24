import mysql from "mysql2/promise";

async function findMyUser() {
  console.log("Conectando ao TiDB Cloud para buscar usuários...");

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "gateway02.us-east-1.prod.aws.tidbcloud.com",
      port: 4000,
      user: "228TB7rmHcwk69v.root",
      password: "lyOk7e704X3c1EdzUpUv",
      database: "furduncinho047", // Adicionamos o banco que queremos ler
      ssl: {
        rejectUnauthorized: true,
      },
    });

    console.log("Conectado! Buscando sua conta...");

    // Executa a consulta para encontrar seu usuário
    const [rows] = await connection.query(
      "SELECT id, email, openId, role FROM users WHERE email = 'endonyparadela2007@gmail.com';"
    );

    console.log("✅ Usuário encontrado! Aqui estão os dados:");
    console.log(rows);

    await connection.end();
  } catch (err) {
    console.error("❌ Erro ao tentar buscar o usuário:");
    console.error(err);
    process.exit(1);
  }
}

findMyUser();
