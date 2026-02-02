// server/routers.ts
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc.js";
import { z } from "zod";
import * as db from "./db.js";
import { users, tickets } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import QRCode from "qrcode";
import bcrypt from "bcrypt";
import { sdk } from "./_core/sdk.js";
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
          name: z.string().min(3),
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email em uso.",
          });

        const passwordHash = await bcrypt.hash(input.password, 10);
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("DB offline");

        const newUserResult = await dbInstance
          .insert(users)
          .values({
            name: input.name,
            email: input.email,
            passwordHash,
            loginMethod: "local",
            openid: `temp_${Date.now()}`,
          })
          .returning({ id: users.id });

        const newUserId = newUserResult[0]?.id;
        const fakeOpenId = `local_user_${newUserId}`;
        await dbInstance
          .update(users)
          .set({ openid: fakeOpenId })
          .where(eq(users.id, newUserId));

        const sessionToken = await sdk.signSession({
          openId: fakeOpenId,
          appId: "furduncinho",
          name: input.name,
        });
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: ONE_YEAR_MS,
        });
        return { success: true };
      }),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (
          !user ||
          !user.passwordHash ||
          !(await bcrypt.compare(input.password, user.passwordHash))
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Credenciais inválidas.",
          });
        }
        const sessionToken = await sdk.signSession({
          openId: user.openid!,
          appId: "furduncinho",
          name: user.name || "User",
        });
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: ONE_YEAR_MS,
        });
        return { success: true, user };
      }),

    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, getSessionCookieOptions(ctx.req));
      return { success: true };
    }),
  }),

  tickets: router({
    create: protectedProcedure
      .input(z.object({ hasCooler: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getTicketsByUserId(ctx.user.id);
        if (existing.some(t => t.status === "pending" || t.status === "paid")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Você já possui um ingresso ativo.",
          });
        }
        const amount = input.hasCooler ? 7000 : 3000;
        const result = await db.createTicket({
          userId: ctx.user.id,
          status: "pending",
          hasCooler: input.hasCooler,
          amount,
        });
        return { success: true, ticketId: result?.[0]?.insertedId };
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const ticket = await db.getTicketById(input.id);
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });
        return ticket;
      }),

    myTickets: protectedProcedure.query(async ({ ctx }) => {
      const tks = await db.getTicketsByUserId(ctx.user.id);
      return Promise.all(
        tks.map(async t => ({
          ...t,
          payment: await db.getPaymentByTicketId(t.id),
        }))
      );
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
          throw new TRPCError({ code: "BAD_REQUEST" });

        const upload = await cloudinary.uploader.upload(
          `data:${input.proofMimeType};base64,${input.proofData}`,
          {
            folder: "furduncinho/comprovantes",
          }
        );

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
            amount: ticket.amount, // USANDO O VALOR DO TICKET SEMPRE!
          });
        }
        return { success: true };
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
        const qrDataUrl = await QRCode.toDataURL(qrHash);
        const upload = await cloudinary.uploader.upload(qrDataUrl, {
          folder: "furduncinho/qrcodes",
        });

        await db.updateTicket(ticket.id, {
          status: "paid",
          qrCodeHash: qrHash,
          ticketCode: generateTicketCode(),
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
        if (!ticket || ticket.status !== "paid")
          return { valid: false, message: "Inválido" };
        await db.updateTicket(ticket.id, {
          status: "used",
          validatedAt: new Date(),
        });
        await db.createCheckinLog({
          ticketId: ticket.id,
          adminId: ctx.user.id,
          result: "valid",
          notes: ticket.hasCooler ? "COM COOLER" : "OK",
        });
        return { valid: true, hasCooler: ticket.hasCooler };
      }),
  }),
});

export type AppRouter = typeof appRouter;
