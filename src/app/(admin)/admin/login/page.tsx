"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("Credenciales inválidas. Por favor, revisa tus datos.");
      toast.error("Credenciales inválidas.");
      setLoading(false);
      return;
    }

    toast.success("Bienvenida de nuevo, Laura.");
    router.replace("/admin/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-10 shadow-xl shadow-slate-200/50">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Panel de Control
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Bienvenida de vuelta, Laura.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 transition-all focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 transition-all focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-4 font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Entrar al panel"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            ← Volver al sitio público
          </button>
        </div>
      </div>
    </div>
  );
}
