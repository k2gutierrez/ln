import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan las variables de entorno de Supabase. Revisa .env.example."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

/** Cliente de Supabase para Server Components, Route Handlers y middleware. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Los Server Components no pueden escribir cookies. El middleware
          // se encarga de refrescar la sesión, así que aquí es seguro ignorar.
        }
      },
    },
  });
}

/** Devuelve el usuario autenticado o null. Valida el JWT contra Supabase. */
export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
