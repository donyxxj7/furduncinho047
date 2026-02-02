import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

// Define a URL base: usa a variável da Vercel ou o caminho relativo
const getBaseUrl = () => {
  // Se estivermos no navegador (produção Vercel), o caminho vazio ""
  // faz o tRPC usar o próprio domínio do site automaticamente.
  return "";
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
