"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPassword() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setHasSession(Boolean(data.user));
      })
      .finally(() => setReady(true));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (password !== confirmation) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(
        "No se pudo actualizar la contraseña. Solicita un enlace nuevo."
      );
      return;
    }

    toast.success("Contraseña actualizada. Ya puedes entrar.");
    router.replace("/admin/dashboard");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center text-slate-500">
        Verificando enlace...
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-xl shadow-slate-200/50">
          <h1 className="mb-3 text-2xl font-bold text-slate-900">
            Enlace inválido o expirado
          </h1>
          <p className="mb-8 text-sm text-slate-500">
            Los enlaces de recuperación caducan y solo se pueden usar una vez.
            Solicita uno nuevo.
          </p>
          <Link
            href="/admin/recuperar"
            className="block rounded-xl bg-slate-900 py-3.5 font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Solicitar un enlace nuevo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-10 shadow-xl shadow-slate-200/50">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Nueva contraseña
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Elige una contraseña de al menos {MIN_PASSWORD_LENGTH} caracteres.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 transition-all focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirmation"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Repite la contraseña
            </label>
            <input
              id="confirmation"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 transition-all focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-4 font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
