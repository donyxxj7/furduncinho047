CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'paid', 'cancelled', 'used');--> statement-breakpoint
CREATE TABLE "checkin_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "checkin_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ticketId" integer NOT NULL,
	"adminId" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"deviceInfo" text,
	"result" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "event_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "event_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_name" text DEFAULT 'Furduncinho 047' NOT NULL,
	"event_date" text NOT NULL,
	"location" text DEFAULT 'Local do Evento' NOT NULL,
	"price_normal" integer DEFAULT 3000 NOT NULL,
	"price_cooler" integer DEFAULT 7000 NOT NULL,
	"service_fee" integer DEFAULT 500 NOT NULL,
	"allow_cooler" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ticketId" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"externalId" varchar(255),
	"comprovantePath" text,
	"rejectionReason" text,
	"approvedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tickets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"hasCooler" boolean DEFAULT false NOT NULL,
	"amount" integer DEFAULT 3000 NOT NULL,
	"qrCodeHash" varchar(255),
	"qrImagePath" text,
	"ticketCode" varchar(50),
	"ticketImagePath" text,
	"generatedAt" timestamp,
	"validatedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openid" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"passwordHash" text,
	"phone" varchar(20),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openid_unique" UNIQUE("openid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "checkin_logs" ADD CONSTRAINT "checkin_logs_ticketId_tickets_id_fk" FOREIGN KEY ("ticketId") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkin_logs" ADD CONSTRAINT "checkin_logs_adminId_users_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_ticketId_tickets_id_fk" FOREIGN KEY ("ticketId") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_approvedBy_users_id_fk" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;