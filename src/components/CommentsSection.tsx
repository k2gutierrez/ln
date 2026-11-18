"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface Comment {
  id: string;
  article_id: string;
  user_name: string;
  content: string;
  created_at: string;
  is_admin_reply: boolean;
}

export default function CommentsSection({
  articleId,
  isAdmin,
}: {
  articleId: string;
  isAdmin: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("id, article_id, user_name, content, created_at, is_admin_reply")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true });

    setComments((data as Comment[]) ?? []);
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article_id: articleId,
          user_name: name,
          content: text,
          // Honeypot: un humano nunca lo rellena.
          website: (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "",
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(payload?.error ?? "No se pudo publicar el comentario.");
        return;
      }

      setText("");
      setName("");
      toast.success("Comentario publicado. ¡Gracias por participar!");
      await fetchComments();
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteComment(id: string) {
    if (!isAdmin) return;
    if (!window.confirm("¿Borrar este comentario?")) return;

    setDeletingId(id);
    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) {
      toast.error("No se pudo borrar el comentario.");
    } else {
      setComments((current) => current.filter((comment) => comment.id !== id));
      toast.success("Comentario eliminado.");
    }

    setDeletingId(null);
  }

  return (
    <section className="mt-16 border-t border-slate-100 pt-12">
      <h2 className="mb-8 text-2xl font-bold text-slate-900">
        Conversación
        {comments.length > 0 && (
          <span className="ml-2 align-middle text-sm font-medium text-slate-500">
            ({comments.length})
          </span>
        )}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mb-12 space-y-4 rounded-3xl bg-slate-50 p-6"
      >
        <div>
          <label htmlFor="comment-name" className="sr-only">
            Tu nombre (opcional)
          </label>
          <input
            id="comment-name"
            name="name"
            type="text"
            maxLength={80}
            autoComplete="name"
            placeholder="Tu nombre (opcional)"
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="comment-text" className="sr-only">
            Escribe tu opinión
          </label>
          <textarea
            id="comment-text"
            name="text"
            required
            minLength={3}
            maxLength={2000}
            placeholder="Escribe tu opinión..."
            className="h-32 w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>

        {/* Honeypot anti-bots: oculto para personas, visible para scripts. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">No rellenar</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Verificando..." : "Publicar comentario"}
        </button>
      </form>

      <div className="space-y-6">
        {comments.length === 0 && (
          <p className="text-sm text-slate-500">
            Todavía no hay comentarios. Sé la primera persona en participar.
          </p>
        )}

        {comments.map((comment) => (
          <article
            key={comment.id}
            className={`rounded-2xl border p-6 ${
              comment.is_admin_reply
                ? "ml-6 border-slate-900 bg-slate-900 text-white md:ml-8"
                : "border-slate-100 bg-white"
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-4">
              <span className="font-bold">
                {comment.user_name}
                {comment.is_admin_reply && " ✓ (Autora)"}
              </span>
              <time
                dateTime={comment.created_at}
                className="text-xs opacity-60"
              >
                {new Date(comment.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            </div>

            <p className="text-sm leading-relaxed">{comment.content}</p>

            {isAdmin && (
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => deleteComment(comment.id)}
                  disabled={deletingId === comment.id}
                  className="text-xs font-bold uppercase tracking-widest text-rose-500 transition-colors hover:text-rose-600 disabled:opacity-50"
                >
                  {deletingId === comment.id ? "Borrando..." : "Borrar"}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
