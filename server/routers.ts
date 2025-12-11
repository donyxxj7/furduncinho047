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
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function generateTicketCode(): string {
  const prefix = "FD047";
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
}

function generateQrHash(ticketId: number, userId: number): string {
  const data = `${ticketId}-${userId}-${Date.now()}-${crypto.randomBytes(16).toString("hex")}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado." });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
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

        // --- CORREÇÃO AQUI ---
        // Adicionamos um openId temporário para o banco aceitar a criação
        const newUserResult = await dbInstance.insert(users).values({
          name: input.name,
          email: input.email,
          passwordHash: passwordHash,
          loginMethod: "local",
          openId: `temp_${Date.now()}_${Math.random()}`, // Valor provisório
        });
        // ---------------------

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

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Credenciais inválidas.",
          });

        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Credenciais inválidas.",
          });

        const sessionToken = await sdk.signSession({
          openId: user.openId!,
          appId: "furduncinho_local_app",
          name: user.name || "User",
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
      return { success: true };
    }),
  }),

  tickets: router({
    create: protectedProcedure.mutation(async ({ ctx }) => {
      // VERSÃO SIMPLIFICADA (SEM LOTES)
      const existingTickets = await db.getTicketsByUserId(ctx.user.id);
      const hasPendingOrPaid = existingTickets.some(
        t => t.status === "pending" || t.status === "paid"
      );

      if (hasPendingOrPaid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você já possui um ingresso.",
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
      return await Promise.all(
        tickets.map(async ticket => {
          const payment = await db.getPaymentByTicketId(ticket.id);
          return {
            ...ticket,
            paymentStatus: payment?.status ?? null,
            rejectionReason: payment?.rejectionReason ?? null,
          };
        })
      );
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const ticket = await db.getTicketById(input.id);
        if (!ticket)
          throw new TRPCError({ code: "NOT_FOUND", message: "Não encontrado" });
        return ticket;
      }),

    listAll: adminProcedure.query(async () => {
      return await db.getAllTickets();
    }),
  }),

  payments: router({
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
        if (!ticket || ticket.status !== "pending")
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Erro no ingresso.",
          });

        const dataURI = `data:${input.proofMimeType};base64,${input.proofData}`;
        const upload = await cloudinary.uploader.upload(dataURI, {
          folder: "furduncinho/comprovantes",
          public_id: `${ctx.user.id}-${input.ticketId}-${Date.now()}`,
        });

        const existing = await db.getPaymentByTicketId(input.ticketId);
        if (existing) {
          await db.updatePayment(existing.id, {
            comprovantePath: upload.secure_url,
            status: "pending",
          });
        } else {
          await db.createPayment({
            ticketId: input.ticketId,
            comprovantePath: upload.secure_url,
            status: "pending",
          });
        }
        return { success: true };
      }),

    getByTicket: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPaymentByTicketId(input.ticketId);
      }),

    listPending: adminProcedure.query(async () => {
      const payments = await db.getPendingPayments();
      const database = await db.getDb();
      if (!database) return [];

      return await Promise.all(
        payments.map(async p => {
          const ticket = await db.getTicketById(p.ticketId);
          const user = ticket
            ? (
                await database
                  .select()
                  .from(users)
                  .where(eq(users.id, ticket.userId))
              )[0]
            : null;
          return { ...p, ticket, user };
        })
      );
    }),

    approve: adminProcedure
      .input(z.object({ paymentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const all = await db.getPendingPayments();
        const payment = all.find(p => p.id === input.paymentId);
        if (!payment) throw new TRPCError({ code: "NOT_FOUND" });

        const ticket = await db.getTicketById(payment.ticketId);
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });

        const qrHash = generateQrHash(ticket.id, ticket.userId);
        const ticketCode = generateTicketCode();
        const qrDataUrl = await QRCode.toDataURL(qrHash);
        const upload = await cloudinary.uploader.upload(qrDataUrl, {
          folder: "furduncinho/qrcodes",
          public_id: `qr-${ticket.id}-${Date.now()}`,
        });

        await db.updateTicket(ticket.id, {
          status: "paid",
          qrCodeHash: qrHash,
          ticketCode,
          qrImagePath: upload.secure_url,
          generatedAt: new Date(),
        });
        await db.updatePayment(payment.id, {
          status: "approved",
          approvedBy: ctx.user.id,
        });
        return { success: true };
      }),

    reject: adminProcedure
      .input(z.object({ paymentId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input }) => {
        const all = await db.getPendingPayments();
        const payment = all.find(p => p.id === input.paymentId);
        if (!payment) throw new TRPCError({ code: "NOT_FOUND" });
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
        if (!ticket) return { valid: false, message: "Não encontrado" };
        if (ticket.status === "used")
          return { valid: false, message: "Já utilizado", ticket };
        if (ticket.status !== "paid")
          return { valid: false, message: "Ingresso inválido", ticket };

        await db.updateTicket(ticket.id, {
          status: "used",
          validatedAt: new Date(),
        });
        await db.createCheckinLog({
          ticketId: ticket.id,
          adminId: ctx.user.id,
          result: "valid",
          notes: "Check-in OK",
        });
        return { valid: true, message: "Acesso Liberado", ticket };
      }),
    logs: adminProcedure.query(async () => await db.getCheckinLogs()),
  }),

  admin: router({
    dashboard: adminProcedure.query(async () => {
      const tickets = await db.getAllTickets();
      const payments = await db.getPendingPayments();
      const logs = await db.getCheckinLogs();
      return {
        totalTickets: tickets.length,
        pendingTickets: tickets.filter(t => t.status === "pending").length,
        paidTickets: tickets.filter(t => t.status === "paid").length,
        usedTickets: tickets.filter(t => t.status === "used").length,
        cancelledTickets: tickets.filter(t => t.status === "cancelled").length,
        pendingPayments: payments.length,
        totalCheckins: logs.filter(l => l.result === "valid").length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
