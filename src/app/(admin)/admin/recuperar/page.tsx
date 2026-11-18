"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/confirm?next=/admin/restablecer`;
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo }
    );

    setLoading(false);

    if (error) {
      toast.error("No se pudo enviar el correo. Inténtalo de nuevo.");
      return;
    }

    // No revelamos si el correo existe o no (evita enumerar cuentas).
    setSent(true);
    toast.success("Si el correo existe, recibirás un enlace.");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-10 shadow-xl shadow-slate-200/50">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Recuperar acceso
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Te enviaremos un enlace para crear una contraseña nueva.
          </p>
        </div>

        {sent ? (
          <div className="space-y-6 text-center">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-sm text-emerald-700">
              Si <strong>{email}</strong> tiene una cuenta, recibirás un correo
              con instrucciones. Revisa también la carpeta de spam.
            </div>
            <Link
              href="/admin/login"
              className="block rounded-xl bg-slate-900 py-3.5 font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 py-4 font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/admin/login"
            className="text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
