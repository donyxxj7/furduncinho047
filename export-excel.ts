import "dotenv/config";
import { getDb } from "./server/db";
import { users, tickets, payments } from "./src/db/schema";
import { eq, or } from "drizzle-orm";
import ExcelJS from "exceljs";

async function exportToExcel() {
  console.log("📊 Iniciando exportação de pagantes aprovados para Excel...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Erro: Não foi possível conectar ao banco de dados.");
    return;
  }

  try {
    const allData = await db
      .select({
        nome: users.name,
        email: users.email,
        cpf: users.cpf,
        status: tickets.status,
        valor: tickets.amount,
        codigo: tickets.ticketCode,
        comprovante: payments.comprovantePath,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .leftJoin(payments, eq(payments.ticketId, tickets.id))
      .where(or(eq(tickets.status, "paid"), eq(tickets.status, "used")));

    if (allData.length === 0) {
      console.warn("⚠️  Atenção: Não existem pagamentos aprovados no momento.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Participantes_Confirmados");

    worksheet.columns = [
      { header: "NOME COMPLETO", key: "nome", width: 30 },
      { header: "CPF", key: "cpf", width: 20 },
      { header: "E-MAIL", key: "email", width: 30 },
      { header: "CÓDIGO INGRESSO", key: "codigo", width: 20 },
      { header: "STATUS", key: "status", width: 15 },
      { header: "VALOR PAGO (R$)", key: "valor", width: 15 },
      { header: "LINK COMPROVANTE", key: "comprovante", width: 50 },
    ];

    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFA855F7" },
      };
    });

    allData.forEach(item => {
      worksheet.addRow({
        nome: item.nome,
        cpf: item.cpf,
        email: item.email,
        codigo: item.codigo || "Pendente",
        status: item.status === "paid" ? "APROVADO" : "CHECK-IN FEITO",
        valor: item.valor ? item.valor / 100 : 0,
        comprovante: item.comprovante || "Manual",
      });
    });

    const filename = `Lista_APROVADOS_${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filename);

    console.log(`\n✨ Exportação concluída!`);
    console.log(`📁 Arquivo gerado: ${filename}`);
  } catch (error: any) {
    console.error("❌ Erro durante a exportação:", error.message);
  }
  // Removido o process.exit para evitar erros de tipagem
}

// Executa a função
exportToExcel().then(() => {
  console.log("👋 Processo finalizado.");
});
