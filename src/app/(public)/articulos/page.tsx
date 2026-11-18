import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateShort } from "@/lib/format";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "La Columna",
  description:
    "Todas las reflexiones semanales de Laura Niebla sobre liderazgo consciente, crecimiento personal y dirección empresarial.",
  alternates: { canonical: "/articulos" },
  openGraph: {
    title: "La Columna | ConIntención",
    description:
      "Reflexiones semanales sobre liderazgo consciente y crecimiento personal.",
    url: "/articulos",
  },
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800";

export default async function AllArticlesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, excerpt, slug, image_url, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const publicados = articles ?? [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-16 text-center md:mb-24">
          <h1 className="mb-6 text-balance font-serif text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            La Columna
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            Explora todas las reflexiones semanales sobre liderazgo consciente,
            crecimiento personal y dirección empresarial.
          </p>
        </header>

        {publicados.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-100 bg-slate-50 p-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="mx-auto mb-4 h-16 w-16 text-slate-300"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
            <h2 className="mb-2 text-xl font-bold text-slate-700">
              Aún no hay publicaciones
            </h2>
            <p className="text-slate-500">
              Los artículos publicados por Laura aparecerán en este espacio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
            {publicados.map((article) => (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <Link
                  href={`/articulos/${article.slug}`}
                  className="relative block h-60 w-full overflow-hidden bg-slate-100"
                >
                  <Image
                    src={article.image_url || FALLBACK_IMAGE}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  />
                </Link>

                <div className="flex flex-grow flex-col p-8">
                  <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <time dateTime={article.published_at}>
                      {formatDateShort(article.published_at)}
                    </time>
                  </p>

                  <Link href={`/articulos/${article.slug}`}>
                    <h2 className="mb-4 text-balance text-2xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-slate-600">
                      {article.title}
                    </h2>
                  </Link>

                  <p className="mb-8 line-clamp-3 flex-grow leading-relaxed text-slate-600">
                    {article.excerpt}
                  </p>

                  <div className="mt-auto border-t border-slate-100 pt-6">
                    <Link
                      href={`/articulos/${article.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition-all group-hover:gap-3"
                    >
                      Leer artículo <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
