export const ENV = {
  appId: process.env.VITE_APP_ID ?? "furduncinho_app",
  cookieSecret: process.env.JWT_SECRET ?? "d5b2a09c2a8f8e1e3b9a0c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f",
  databaseUrl: process.env.DATABASE_URL ?? "",
  // Deixamos vazio para o SDK saber que não deve buscar fora
  oAuthServerUrl: "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "admin_root",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
