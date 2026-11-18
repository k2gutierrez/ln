import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase.\n" +
      "Crea un archivo .env.local a partir de .env.example y define:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL\n" +
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY\n" +
      "Después reinicia el servidor (npm run dev)."
  );
}

// Cliente para componentes de navegador. Guarda la sesión en cookies
// para que el middleware y los Server Components puedan leerla.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
