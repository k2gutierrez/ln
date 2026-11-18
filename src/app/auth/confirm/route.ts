import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Detrás de Amplify, `request.url` puede traer el host interno
 * (localhost:3000). Para los redirects usamos, en orden:
 *  1. x-forwarded-host (el host público real)
 *  2. NEXT_PUBLIC_SITE_URL (dominio canónico configurado)
 *  3. el origen de la petición (desarrollo local)
 */
function resolvePublicOrigin(request: Request, fallback: string): string {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  if (
    forwardedHost &&
    !/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(forwardedHost)
  ) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (envUrl) return envUrl;

  return fallback;
}

/**
 * Destino del enlace de recuperación de contraseña.
 *
 * Acepta dos variantes:
 *  - token_hash + type  → plantilla de correo personalizada (recomendado).
 *  - code               → flujo PKCE de Supabase.
 *
 * Si la verificación funciona, deja la sesión en cookies y manda a la
 * pantalla donde se define la nueva contraseña.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = resolvePublicOrigin(request, url.origin);

  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");

  const rawNext = url.searchParams.get("next") ?? "/admin/restablecer";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/admin/restablecer";

  const supabase = await createSupabaseServerClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(
    new URL("/admin/recuperar?error=enlace", origin)
  );
}
