"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { formatDateShort } from "@/lib/format";

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

  const fetchArticles = useCallback(async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, published_at, is_published, slug")
      .order("published_at", { ascending: false });

    if (error) {
      toast.error("No se pudieron cargar los artículos.");
    } else {
      setArticles((data as Article[]) ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  async function togglePublish(article: Article) {
    const nextState = !article.is_published;

    setArticles((current) =>
      current.map((item) =>
        item.id === article.id ? { ...item, is_published: nextState } : item
      )
    );

    const { error } = await supabase
      .from("articles")
      .update({ is_published: nextState })
      .eq("id", article.id);

    if (error) {
      setArticles((current) =>
        current.map((item) =>
          item.id === article.id
            ? { ...item, is_published: article.is_published }
            : item
        )
      );
      toast.error("No se pudo cambiar el estado del artículo.");
      return;
    }

    toast.success(
      nextState ? "Artículo publicado." : "Artículo movido a borradores."
    );
  }

  async function deleteArticle(article: Article) {
    if (
      !window.confirm(
        `¿Eliminar definitivamente «${article.title}»? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", article.id);

    if (error) {
      toast.error("No se pudo eliminar el artículo.");
      return;
    }

    setArticles((current) =>
      current.filter((item) => item.id !== article.id)
    );
    toast.success("Artículo eliminado.");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              ← Volver al Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Mis Artículos
            </h1>
          </div>
          <Link
            href="/admin/dashboard/articulos/nuevo"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800"
          >
            + Nuevo artículo
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            Cargando artículos...
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Aún no has escrito ningún artículo. ¡Empieza hoy mismo!
          </div>
        ) : (
          <>
            {/* Escritorio: tabla */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Título
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">
                          {article.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => togglePublish(article)}
                          className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                            article.is_published
                              ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {article.is_published ? "Publicado" : "Borrador"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDateShort(article.published_at)}
                      </td>
                      <td className="space-x-3 px-6 py-4 text-right">
                        <Link
                          href={`/admin/dashboard/articulos/editar/${article.id}`}
                          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteArticle(article)}
                          className="text-sm font-medium text-rose-500 transition-colors hover:text-rose-600"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Móvil: tarjetas */}
            <div className="space-y-4 md:hidden">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold leading-snug text-slate-900">
                      {article.title}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        article.is_published
                          ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      {article.is_published ? "Publicado" : "Borrador"}
                    </span>
                  </div>

                  <p className="mb-4 text-sm text-slate-500">
                    {formatDateShort(article.published_at)}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => togglePublish(article)}
                      className="text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      {article.is_published ? "Despublicar" : "Publicar"}
                    </button>
                    <Link
                      href={`/admin/dashboard/articulos/editar/${article.id}`}
                      className="text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteArticle(article)}
                      className="text-sm font-medium text-rose-500 hover:text-rose-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
