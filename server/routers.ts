import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import QRCode from "qrcode";
import bcrypt from "bcrypt";
import { sdk } from "./_core/sdk";
// --- 1. IMPORTAR CLOUDINARY ---
import { v2 as cloudinary } from "cloudinary";

// --- 2. CONFIGURAR COM SUAS CREDENCIAIS ---
cloudinary.config({
  cloud_name: "dpp25ffrr",
  api_key: "259293317835167",
  api_secret: "QlIAoaDAz-7k-idnTqtzz_vYLAk",
});

// Helper para gerar código único do ingresso
function generateTicketCode(): string {
  const prefix = "FD047";
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
}

// Helper para gerar hash criptografada do QR Code
function generateQrHash(ticketId: number, userId: number): string {
  const data = `${ticketId}-${userId}-${Date.now()}-${crypto
    .randomBytes(16)
    .toString("hex")}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Procedure para admin apenas
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado. Apenas administradores.",
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    // ROTA PARA CRIAR UMA NOVA CONTA
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
          email: z.string().email("Email inválido"),
          password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Este email já está em uso.",
          });
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        const newUserResult = await dbInstance.insert(users).values({
          name: input.name,
          email: input.email,
          passwordHash: passwordHash,
          loginMethod: "local",
        });

        const newUserId = Number((newUserResult as any)[0].insertId);

        if (isNaN(newUserId) || newUserId === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao criar usuário, não foi possível obter o ID.",
          });
        }

        const fakeOpenId = `local_user_${newUserId}`;
        await dbInstance
          .update(users)
          .set({ openId: fakeOpenId })
          .where(eq(users.id, newUserId));

        const newUser = await db.getUserById(newUserId);
        if (!newUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao buscar usuário recém-criado.",
          });
        }

        const sessionToken = await sdk.signSession({
          openId: fakeOpenId,
          appId: "furduncinho_local_app",
          name: input.name,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true, user: newUser };
      }),

    // ROTA PARA FAZER LOGIN
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);

        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email ou senha inválidos.",
          });
        }

        const isPasswordValid = await bcrypt.compare(
          input.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email ou senha inválidos.",
          });
        }

        const sessionName = user.name || user.email.split("@")[0] || "Usuário";

        const sessionToken = await sdk.signSession({
          openId: user.openId!,
          appId: "furduncinho_local_app",
          name: sessionName,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true, user };
      }),

    me: publicProcedure.query(opts => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions });
      return {
        success: true,
      } as const;
    }),
  }),

  tickets: router({
    create: protectedProcedure.mutation(async ({ ctx }) => {
      const existingTickets = await db.getTicketsByUserId(ctx.user.id);
      const hasPendingOrPaid = existingTickets.some(
        t => t.status === "pending" || t.status === "paid"
      );

      if (hasPendingOrPaid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você já possui um ingresso pendente ou pago.",
        });
      }

      const result = await db.createTicket({
        userId: ctx.user.id,
        status: "pending",
      });

      const insertId = (result as any)[0].insertId || 0;
      return { success: true, ticketId: Number(insertId) };
    }),

    myTickets: protectedProcedure.query(async ({ ctx }) => {
      const tickets = await db.getTicketsByUserId(ctx.user.id);

      // "Enriquece" os tickets com as informações de pagamento
      const enrichedTickets = await Promise.all(
        tickets.map(async ticket => {
          // Busca o último pagamento associado a este ticket
          const payment = await db.getPaymentByTicketId(ticket.id);
          return {
            ...ticket,
            paymentStatus: payment?.status ?? null,
            rejectionReason: payment?.rejectionReason ?? null,
          };
        })
      );

      return enrichedTickets;
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const ticket = await db.getTicketById(input.id);

        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ingresso não encontrado.",
          });
        }

        if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
          console.warn(
            `[Hack Local] Admin (ID: ${ctx.user.id}) acessando ticket de outro usuário (ID: ${ticket.userId})`
          );
        }

        return ticket;
      }),

    listAll: adminProcedure.query(async () => {
      return await db.getAllTickets();
    }),
  }),

  payments: router({
    // ENVIO DE COMPROVANTE (AGORA COM CLOUDINARY)
    submitProof: protectedProcedure
      .input(
        z.object({
          ticketId: z.number(),
          proofData: z.string(),
          proofMimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const ticket = await db.getTicketById(input.ticketId);

        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ingresso não encontrado.",
          });
        }

        if (ticket.status !== "pending") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Este ingresso não está mais pendente.",
          });
        }

        // --- UPLOAD PARA CLOUDINARY ---
        // Monta a Data URI (formato que o Cloudinary aceita direto)
        const dataURI = `data:${input.proofMimeType};base64,${input.proofData}`;

        let secureUrl = "";

        try {
          const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: "furduncinho/comprovantes",
            public_id: `${ctx.user.id}-${input.ticketId}-${Date.now()}`,
            resource_type: "auto",
          });

          secureUrl = uploadResponse.secure_url;
          console.log(`[Cloudinary] Comprovante salvo: ${secureUrl}`);
        } catch (error) {
          console.error("[Cloudinary] Erro no upload:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao salvar imagem na nuvem.",
          });
        }
        // --- FIM UPLOAD ---

        const existingPayment = await db.getPaymentByTicketId(input.ticketId);

        if (existingPayment) {
          await db.updatePayment(existingPayment.id, {
            comprovantePath: secureUrl,
            status: "pending",
          });
        } else {
          await db.createPayment({
            ticketId: input.ticketId,
            comprovantePath: secureUrl,
            status: "pending",
          });
        }

        return { success: true };
      }),

    getByTicket: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ ctx, input }) => {
        const ticket = await db.getTicketById(input.ticketId);

        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ingresso não encontrado.",
          });
        }

        if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
          console.warn(
            `[Hack Local] Admin (ID: ${ctx.user.id}) acessando pagamento de outro usuário (ID: ${ticket.userId})`
          );
        }

        const payment = await db.getPaymentByTicketId(input.ticketId);
        return payment || null;
      }),

    listPending: adminProcedure.query(async () => {
      const payments = await db.getPendingPayments();
      const database = await db.getDb();

      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const enrichedPayments = await Promise.all(
        payments.map(async payment => {
          const ticket = await db.getTicketById(payment.ticketId);
          let user = null;

          if (ticket) {
            const userResult = await database
              .select()
              .from(users)
              .where(eq(users.id, ticket.userId))
              .limit(1);
            user = userResult.length > 0 ? userResult[0] : null;
          }

          return {
            ...payment,
            ticket,
            user,
          };
        })
      );

      return enrichedPayments;
    }),

    // APROVAÇÃO COM GERAÇÃO DE QR CODE (AGORA COM CLOUDINARY)
    approve: adminProcedure
      .input(z.object({ paymentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const allPayments = await db.getPendingPayments();
        const payment = allPayments.find(p => p.id === input.paymentId);

        if (!payment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Pagamento com ID ${input.paymentId} não encontrado ou não está pendente.`,
          });
        }

        const ticket = await db.getTicketById(payment.ticketId);

        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Ingresso (ID: ${payment.ticketId}) associado ao pagamento não encontrado.`,
          });
        }

        const qrHash = generateQrHash(ticket.id, ticket.userId);
        const ticketCode = generateTicketCode();

        const qrCodeDataUrl = await QRCode.toDataURL(qrHash, {
          width: 512,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        // --- UPLOAD QR CODE PARA CLOUDINARY ---
        let qrImageUrl = "";
        try {
          // O qrCodeDataUrl já é uma string "data:image/png;base64...", o Cloudinary aceita direto
          const uploadResponse = await cloudinary.uploader.upload(
            qrCodeDataUrl,
            {
              folder: "furduncinho/qrcodes",
              public_id: `qr-${ticket.id}-${Date.now()}`,
              resource_type: "image",
            }
          );

          qrImageUrl = uploadResponse.secure_url;
          console.log(`[Cloudinary] QR Code salvo: ${qrImageUrl}`);
        } catch (error) {
          console.error("[Cloudinary] Erro no upload do QR Code:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao salvar QR Code na nuvem.",
          });
        }
        // --- FIM UPLOAD ---

        await db.updateTicket(ticket.id, {
          status: "paid",
          qrCodeHash: qrHash,
          ticketCode: ticketCode,
          qrImagePath: qrImageUrl,
          generatedAt: new Date(),
        });

        await db.updatePayment(payment.id, {
          status: "approved",
          approvedBy: ctx.user.id,
        });

        return { success: true, qrHash, ticketCode };
      }),

    reject: adminProcedure
      .input(
        z.object({
          paymentId: z.number(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const allPayments = await db.getPendingPayments();
        const payment = allPayments.find(p => p.id === input.paymentId);

        if (!payment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Pagamento com ID ${input.paymentId} não encontrado ou não está pendente.`,
          });
        }

        await db.updatePayment(payment.id, {
          status: "rejected",
          rejectionReason: input.reason,
        });

        return { success: true };
      }),
  }),

  scanner: router({
    validate: adminProcedure
      .input(z.object({ qrHash: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const ticket = await db.getTicketByQrHash(input.qrHash);

        if (!ticket) {
          await db.createCheckinLog({
            ticketId: 0,
            adminId: ctx.user.id,
            result: "invalid",
            notes: "QR Code não encontrado",
          });

          return {
            valid: false,
            message: "Ingresso inexistente",
            result: "invalid" as const,
          };
        }

        if (ticket.status === "used") {
          await db.createCheckinLog({
            ticketId: ticket.id,
            adminId: ctx.user.id,
            result: "used",
            notes: "Tentativa de uso de ingresso já utilizado",
          });

          return {
            valid: false,
            message: "Ingresso já utilizado",
            result: "used" as const,
            ticket,
          };
        }

        if (ticket.status !== "paid") {
          await db.createCheckinLog({
            ticketId: ticket.id,
            adminId: ctx.user.id,
            result: "invalid",
            notes: "Status do ingresso inválido: " + ticket.status,
          });

          return {
            valid: false,
            message: "Ingresso com status inválido",
            result: "invalid" as const,
            ticket,
          };
        }

        await db.updateTicket(ticket.id, {
          status: "used",
          validatedAt: new Date(),
        });

        await db.createCheckinLog({
          ticketId: ticket.id,
          adminId: ctx.user.id,
          result: "valid",
          notes: "Check-in realizado com sucesso",
        });

        return {
          valid: true,
          message: "Ingresso válido",
          result: "valid" as const,
          ticket,
        };
      }),

    logs: adminProcedure.query(async () => {
      return await db.getCheckinLogs();
    }),
  }),

  admin: router({
    dashboard: adminProcedure.query(async () => {
      const allTickets = await db.getAllTickets();
      const pendingPayments = await db.getPendingPayments();
      const checkinLogs = await db.getCheckinLogs();

      return {
        totalTickets: allTickets.length,
        pendingTickets: allTickets.filter(t => t.status === "pending").length,
        paidTickets: allTickets.filter(t => t.status === "paid").length,
        usedTickets: allTickets.filter(t => t.status === "used").length,
        cancelledTickets: allTickets.filter(t => t.status === "cancelled")
          .length,
        pendingPayments: pendingPayments.length,
        totalCheckins: checkinLogs.filter(l => l.result === "valid").length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
