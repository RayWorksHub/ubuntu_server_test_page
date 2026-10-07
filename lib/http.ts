import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function validationError(error: ZodError) {
  return jsonError("A megadott adatok hibásak.", 400, error.flatten().fieldErrors);
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function assertSameOrigin(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") throw new Error("CSRF");

  const origin = request.headers.get("origin");
  if (!origin) return;

  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");
  if (!forwardedHost || origin !== `${forwardedProto}://${forwardedHost}`) throw new Error("CSRF");
}

export function userAgent(request: Request) {
  return request.headers.get("user-agent")?.slice(0, 500) || "Ismeretlen eszköz";
}
