import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../server/routers";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "https://furduncinho047.onrender.com/api/trpc",
      transformer: superjson, // ✔️ CORRETO no v11
      async headers() {
        return {};
      },
    }),
  ],
});
