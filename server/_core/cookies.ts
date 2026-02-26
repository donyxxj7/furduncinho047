import type { CookieOptions } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string | undefined) {
  if (!host) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: any) {
  // Usamos 'any' aqui para evitar o erro de protocolo/headers na Vercel
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers?.["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(
    (proto: string) => proto.trim().toLowerCase() === "https"
  );
}

export function getSessionCookieOptions(
  req: any // Forçamos 'any' no parâmetro para matar o erro TS2339
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname || "localhost";
  const isLocal = LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);
  const isReqSecure = isSecureRequest(req);

  return {
    httpOnly: true,
    path: "/",
    sameSite: isLocal ? "lax" : isReqSecure ? "none" : "lax",
    secure: isReqSecure,
    domain: isLocal ? undefined : hostname,
  };
}
