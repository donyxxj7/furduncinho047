import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      transformer: superjson,
      // TEM QUE SER O LINK COMPLETO DO RENDER:
      url: "https://furduncinho047.onrender.com/api/trpc",
      async headers() {
        return {};
      },
    }),
  ],
});
