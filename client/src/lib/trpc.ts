import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

// Define a URL base: usa a variável da Vercel ou o caminho relativo
const getBaseUrl = () => {
  if (import.meta.env.VITE_TRPC_URL) return import.meta.env.VITE_TRPC_URL; // Usa a variável que vamos por na Vercel
  return ""; // Em produção na Vercel, o caminho relativo funciona melhor
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: `${getBaseUrl()}/api/trpc`, // Agora a URL se ajusta sozinha!
      async headers() {
        return {};
      },
    }),
  ],
});
