import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string | undefined) {
  if (!host) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  // @ts-ignore - Força a leitura do protocol se o TS reclamar na Vercel
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  // Tipagem explícita (proto: string) resolve o erro TS7006
  return protoList.some(
    (proto: string) => proto.trim().toLowerCase() === "https"
  );
}

export function getSessionCookieOptions(
  req: any // Trocamos Request por any aqui para matar os erros de uma vez
): any {
  // Retorno any para evitar o erro de constraint 'never'
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
