"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export default function DailyQuoteAdmin() {
  const [id, setId] = useState("");
  const [text, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadQuote = useCallback(async () => {
    const { data, error } = await supabase
      .from("daily_quotes")
      .select("id, text")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.error("No se pudo cargar la frase actual.");
    } else if (data) {
      setId(data.id);
      setContent(data.text ?? "");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  async function handleSave() {
    if (!text.trim()) return;

    setSaving(true);

    try {
      if (id) {
        const { error: deactivateError } = await supabase
          .from("daily_quotes")
          .update({ is_active: false })
          .eq("id", id);

        if (deactivateError) throw deactivateError;
      }

      const { error } = await supabase.from("daily_quotes").insert({
        text: text.trim(),
        is_active: true,
      });

      if (error) throw error;

      toast.success("Frase del día actualizada.");
      await loadQuote();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la frase.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse p-20 text-center text-slate-500">
        Cargando frase actual...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10">
          <Link
            href="/admin/dashboard"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            ← Volver al Dashboard
          </Link>
          <h1 className="mt-2 font-serif text-3xl font-bold text-slate-900">
            Frase del Día
          </h1>
          <p className="mt-2 text-slate-500">
            Esta frase aparece en la portada del sitio.
          </p>
        </header>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <label
              htmlFor="quote-text"
              className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500"
            >
              Contenido de la frase
            </label>
            <textarea
              id="quote-text"
              value={text}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              maxLength={280}
              placeholder="Escribe una frase inspiradora..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xl font-medium text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <p className="mt-2 text-right text-xs text-slate-500">
              {text.length}/280
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Guardando cambios..." : "Actualizar frase"}
          </button>
        </div>
      </div>
    </div>
  );
}
