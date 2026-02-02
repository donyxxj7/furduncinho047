import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { users, tickets } from "../src/db/schema";
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

        const newUserResult = await dbInstance
          .insert(users)
          .values({
            name: input.name,
            email: input.email,
            passwordHash: passwordHash,
            loginMethod: "local",
            openid: `temp_${Date.now()}`,
          })
          .returning({ id: users.id });

        const newUserId = newUserResult[0]?.id;

        if (!newUserId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao criar usuário.",
          });
        }

        const fakeOpenId = `local_user_${newUserId}`;
        await dbInstance
          .update(users)
          .set({ openid: fakeOpenId })
          .where(eq(users.id, newUserId));

        const newUser = await db.getUserById(newUserId);
        if (!newUser) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const sessionToken = await sdk.signSession({
          openId: fakeOpenId,
          appId: "furduncinho_local_app",
          name: input.name,
        } as any);

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
          openId: user.openid!,
          appId: "furduncinho_local_app",
          name: user.name || "User",
        } as any);

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
    create: protectedProcedure
      .input(z.object({ hasCooler: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const existingTickets = await db.getTicketsByUserId(ctx.user.id);
        const hasActive = existingTickets.some(
          t => t.status === "pending" || t.status === "paid"
        );

        if (hasActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Você já possui um ingresso.",
          });
        }

        const finalAmount = input.hasCooler ? 7000 : 3000;

        const result = await db.createTicket({
          userId: ctx.user.id,
          status: "pending",
          hasCooler: input.hasCooler,
          amount: finalAmount,
        });

        const ticketId = result?.[0]?.insertedId;

        if (!ticketId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao gerar o pedido no banco de dados.",
          });
        }

        return { success: true, ticketId };
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
      .query(async ({ input }) => {
        const ticket = await db.getTicketById(input.id);
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });
        return ticket;
      }),

    listAll: adminProcedure.query(async () => await db.getAllTickets()),
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
            amount: ticket.amount || 3000,
          });
        }
        return { success: true };
      }),

    listPending: adminProcedure.query(async () => {
      const payments = await db.getPendingPayments();
      return await Promise.all(
        payments.map(async p => {
          const ticket = await db.getTicketById(p.ticketId);
          const user = ticket ? await db.getUserById(ticket.userId) : null;
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
          notes: ticket.hasCooler ? "Entrou com Cooler" : "Check-in OK",
        });

        // Retornamos hasCooler para o frontend mostrar o alerta azul/verde
        return {
          valid: true,
          message: "Acesso Liberado",
          hasCooler: ticket.hasCooler,
          ticket,
        };
      }),
    logs: adminProcedure.query(async () => await db.getCheckinLogs()),
  }),

  admin: router({
    dashboard: adminProcedure.query(async () => {
      const ticketsList = await db.getAllTickets();
      const paymentsList = await db.getPendingPayments();
      const logs = await db.getCheckinLogs();
      return {
        totalTickets: ticketsList.length,
        pendingTickets: ticketsList.filter(t => t.status === "pending").length,
        paidTickets: ticketsList.filter(t => t.status === "paid").length,
        usedTickets: ticketsList.filter(t => t.status === "used").length,
        cancelledTickets: ticketsList.filter(t => t.status === "cancelled")
          .length,
        pendingPayments: paymentsList.length,
        totalCheckins: logs.filter(l => l.result === "valid").length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
