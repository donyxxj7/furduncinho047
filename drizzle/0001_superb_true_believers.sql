ALTER TABLE "users" ADD COLUMN "cpf" varchar(14);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_cpf_unique" UNIQUE("cpf");