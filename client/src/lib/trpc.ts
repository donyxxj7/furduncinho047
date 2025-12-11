import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      transformer: superjson, // O transformer fica AQUI no cliente

      url: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api/trpc`
        : "http://localhost:3000/api/trpc",

      async headers() {
        return {};
      },
    }),
  ],
});
