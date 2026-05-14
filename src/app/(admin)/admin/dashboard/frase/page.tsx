'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DailyQuoteAdmin() {
  const [id, setId] = useState('');
  const [text, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadQuote();
  }, []);

  async function loadQuote() {
    try {
      // Buscamos la frase con ID 1 (nuestra frase fija)
      const { data, error } = await supabase
        .from('daily_quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setId(data.id)
        setContent(data.content || data.text || '');
      }
    } catch (err) {
      console.error('Error cargando frase:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const { data } = await supabase
        .from('daily_quotes')
        .update({ is_active: false })
        .eq('id', id)
        .select();

      // Usamos .upsert para que si existe la actualice y si no, la cree
      const { error } = await supabase
        .from('daily_quotes')
        .insert({ 
          text,
          is_active: true,
          created_at: new Date().toISOString() 
        });

      if (error) throw error;

      setMessage({ type: 'success', text: '¡Frase actualizada correctamente!' });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error al guardar: ' + err.message });
    } finally {
      await loadQuote();
      setSaving(false);
    }
  }

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-500">Cargando frase actual...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10">
          <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-2 font-serif">Frase del Día</h1>
          <p className="text-slate-500 mt-2">Esta frase aparecerá en la página de inicio y en la biblioteca de artículos.</p>
        </header>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Contenido de la frase</label>
            <textarea
              value={text}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Escribe una frase inspiradora..."
              className="w-full text-xl font-medium border-slate-100 rounded-2xl focus:ring-slate-900 focus:border-slate-900 p-4 bg-slate-50"
            />
          </div>

          {/*<div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Autor (Opcional)</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ej: Laura Niebla o Marco Aurelio"
              className="w-full border-slate-100 rounded-2xl focus:ring-slate-900 focus:border-slate-900 p-4 bg-slate-50"
            />
          </div>*/}

          {message && (
            <div className={`p-4 rounded-2xl text-sm font-medium ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !text}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            {saving ? 'Guardando cambios...' : 'Actualizar Frase'}
          </button>
        </div>
      </div>
    </div>
  );
}