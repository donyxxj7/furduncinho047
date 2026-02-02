import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers.js";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson"; // Importe o superjson

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  return "";
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      transformer: superjson, // Adicione o transformer aqui
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});
