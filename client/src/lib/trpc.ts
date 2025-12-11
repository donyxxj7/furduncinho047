import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  transformer: superjson, // <-- Agora fica AQUI, não dentro do link
  links: [
    httpBatchLink({
      url: "https://furduncinho047.onrender.com/api/trpc",
      async headers() {
        return {};
      },
    }),
  ],
});
