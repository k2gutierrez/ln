import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/admin/recuperar?error=enlace", url.origin)
  );
}
