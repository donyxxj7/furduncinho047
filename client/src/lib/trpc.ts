import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      transformer: superjson,

      // --- CORREÇÃO FINAL: LINK DIRETO ---
      // Forçamos o site a sempre olhar para o servidor do Render
      url: "https://furduncinho047.onrender.com/api/trpc",
      // ----------------------------------

      async headers() {
        return {};
      },
    }),
  ],
});
