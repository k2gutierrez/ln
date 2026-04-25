'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'ideas' | 'draft'>('ideas');
  const [wordCount, setWordCount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type, wordCount }),
      });

      const data = await res.json();
      
      if (data.success) {
        setResult(data.text);
      } else {
        alert('Hubo un error de comunicación con la IA.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert('¡Copiado al portapapeles!');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
            ← Volver al Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Tu Asistente Creativo</h1>
            <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md">BETA</span>
          </div>
          <p className="text-slate-500 mt-2">Usa la IA para rebotar ideas o crear primeros borradores basados en tu propio estilo de escritura.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Panel de Controles */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">¿Qué necesitas?</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setType('ideas')}
                      className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${type === 'ideas' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Lluvia de ideas
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('draft')}
                      className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${type === 'draft' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Borrador
                    </button>
                  </div>
                </div>

                {type === 'draft' && (
                  <div>
                    <label className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                      <span>Palabras aprox.</span>
                      <span className="text-slate-900">{wordCount}</span>
                    </label>
                    <input 
                      type="range" 
                      min="300" max="1500" step="100"
                      value={wordCount}
                      onChange={(e) => setWordCount(Number(e.target.value))}
                      className="w-full accent-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Tema o Premisa</label>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ej: Cómo el síndrome del impostor afecta a las mujeres en puestos directivos..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm text-slate-700 resize-none bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-slate-900 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md shadow-slate-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-pulse">Pensando...</span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                      Generar contenido
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Panel de Resultados */}
          <div className="lg:col-span-8">
            <div className="bg-white h-full min-h-[500px] p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Resultado de la IA</h2>
                {result && (
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                    Copiar
                  </button>
                )}
              </div>
              
              <div className="flex-grow bg-slate-50 rounded-xl p-6 border border-slate-100 overflow-y-auto max-h-[600px] whitespace-pre-wrap text-slate-700 leading-relaxed font-serif">
                {result ? result : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <p>La IA analizará tu estilo de los últimos artículos publicados<br/>y generará contenido con tu misma voz.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}