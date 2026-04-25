'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Quote {
  id: string;
  text: string;
  is_active: boolean;
  created_at: string;
}

export default function DailyQuoteModule() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [newQuote, setNewQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  async function fetchQuotes() {
    const { data, error } = await supabase
      .from('daily_quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setQuotes(data || []);
    setLoading(false);
  }

  async function handleAddQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuote.trim()) return;

    setSaving(true);
    const { error } = await supabase
      .from('daily_quotes')
      .insert([{ text: newQuote, is_active: true }]);

    if (!error) {
      setNewQuote('');
      fetchQuotes();
    }
    setSaving(false);
  }

  async function toggleActive(id: string, currentState: boolean) {
    // Para simplificar, si activamos una, desactivamos todas las demás primero
    if (!currentState) {
      await supabase
        .from('daily_quotes')
        .update({ is_active: false })
        .neq('id', id);
    }

    const { error } = await supabase
      .from('daily_quotes')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (!error) fetchQuotes();
  }

  async function deleteQuote(id: string) {
    if (!confirm('¿Estás segura de eliminar esta frase?')) return;
    
    const { error } = await supabase
      .from('daily_quotes')
      .delete()
      .eq('id', id);

    if (!error) fetchQuotes();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-2 font-serif">Frase del Día</h1>
          <p className="text-slate-500 mt-1">Este pensamiento aparecerá en la parte superior de tu página principal.</p>
        </header>

        {/* Formulario de Nueva Frase */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
          <form onSubmit={handleAddQuote} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Nueva Frase o Pensamiento</label>
              <textarea
                rows={3}
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                placeholder="Escribe algo inspirador..."
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-lg text-slate-700 leading-relaxed resize-none bg-slate-50/50"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !newQuote.trim()}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md shadow-slate-200"
              >
                {saving ? 'Publicando...' : 'Publicar Frase'}
              </button>
            </div>
          </form>
        </div>

        {/* Historial de Frases */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2">Historial de pensamientos</h2>
          
          {loading ? (
            <div className="text-center py-10 text-slate-400 italic">Cargando historial...</div>
          ) : (
            quotes.map((quote) => (
              <div 
                key={quote.id} 
                className={`bg-white p-6 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  quote.is_active ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200'
                }`}
              >
                <div className="flex-grow">
                  <p className="text-slate-700 text-lg leading-relaxed">"{quote.text}"</p>
                  <p className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-wider">
                    {new Date(quote.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleActive(quote.id, quote.is_active)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tighter transition-all ${
                      quote.is_active 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {quote.is_active ? 'Activa' : 'Activar'}
                  </button>
                  <button 
                    onClick={() => deleteQuote(quote.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors self-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}

          {!loading && quotes.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
              No hay frases registradas aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}