import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // Lógica de domínio (pode ser útil no futuro)
  const hostname = req.hostname;
  const isLocal = LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);

  // --- A CORREÇÃO ESTÁ AQUI ---
  // Para localhost, usamos 'lax'. Para produção (https), usamos 'none' e 'secure'.
  const isReqSecure = isSecureRequest(req);

  return {
    httpOnly: true,
    path: "/",
    // 'lax' funciona em localhost e é o padrão moderno.
    // Em produção (https), você pode mudar para 'none' se precisar de cross-site.
    sameSite: isLocal ? "lax" : isReqSecure ? "none" : "lax",
    secure: isReqSecure,
  };
}
