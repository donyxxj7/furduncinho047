const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

type SameSite = "lax" | "strict" | "none";

/**
 * Tipo local (não depende de Express nem do pacote cookie)
 * Contém apenas as opções que você usa.
 */
export type SessionCookieOptions = {
  domain?: string;
  httpOnly: boolean;
  path: string;
  sameSite: SameSite;
  secure: boolean;
};

function isIpAddress(host: string | undefined) {
  if (!host) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true; // IPv4
  return host.includes(":"); // IPv6 (simplificado)
}

function isSecureRequest(req: any) {
  // Se seu Express estiver setando req.protocol:
  if (req?.protocol === "https") return true;

  // Na Vercel / proxies:
  const forwardedProto = req?.headers?.["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : String(forwardedProto).split(",");

  return protoList.some((p: string) => p.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: any): SessionCookieOptions {
  const hostname: string = req?.hostname || "localhost";
  const isLocal = LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);
  const isReqSecure = isSecureRequest(req);

  // Regra: SameSite="none" exige Secure=true (senão browser pode bloquear)
  const sameSite: SameSite = isLocal ? "lax" : isReqSecure ? "none" : "lax";

  return {
    httpOnly: true,
    path: "/",
    sameSite,
    secure: isReqSecure,
    domain: isLocal ? undefined : hostname,
  };
}
