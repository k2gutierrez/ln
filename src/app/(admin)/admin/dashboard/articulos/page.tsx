'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface Article {
  id: string;
  title: string;
  published_at: string;
  is_published: boolean;
  slug: string;
}

export default function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, published_at, is_published, slug')
      .order('published_at', { ascending: false });

    if (!error) setArticles(data || []);
    setLoading(false);
  }

  async function togglePublish(id: string, currentState: boolean) {
    const { error } = await supabase
      .from('articles')
      .update({ is_published: !currentState })
      .eq('id', id);

    if (!error) fetchArticles();
  }

  async function deleteArticle(id: string) {
    if (!confirm('¿Estás segura de eliminar este artículo permanentemente?')) return;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      alert('No se pudo eliminar el artículo.');
    } else {
      // Actualizamos la lista localmente para no recargar
      setArticles(articles.filter(a => a.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              ← Volver al Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Mis Artículos</h1>
          </div>
          <Link
            href="/admin/dashboard/articulos/nuevo"
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
          >
            + Nuevo Artículo
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Cargando artículos...</div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">{article.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(article.id, article.is_published)}
                        className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${article.is_published
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                      >
                        {article.is_published ? 'Publicado' : 'Borrador'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(article.published_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link
                        href={`/admin/dashboard/articulos/editar/${article.id}`}
                        className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => deleteArticle(article.id)} 
                        className="text-rose-400 hover:text-rose-600 transition-colors text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {articles.length === 0 && (
              <div className="p-20 text-center text-slate-400 text-sm">
                Aún no has escrito ningún artículo. ¡Empieza hoy mismo!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}