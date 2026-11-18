import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ArticleCarousel from "@/components/ArticleCarousel";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const [{ data: quoteData }, { data: articlesData }] = await Promise.all([
    supabase
      .from("daily_quotes")
      .select("text")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("articles")
      .select("id, title, excerpt, slug, image_url, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  const dailyQuote: string = quoteData?.text ?? "";
  const articles = articlesData ?? [];

  return (
    <div className="flex flex-col">
      {dailyQuote && (
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-3 text-center">
          <p className="font-serif text-sm italic tracking-wide text-slate-600 md:text-base">
            &ldquo;{dailyQuote}&rdquo;
          </p>
        </div>
      )}

      <section className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
        <h1 className="mb-8 text-balance font-serif text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
          Ideas claras para mentes <br className="hidden md:block" /> que
          lideran.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
          Un espacio semanal dedicado a la reflexión empresarial, el liderazgo
          consciente y el crecimiento personal. Escrito por{" "}
          <strong>Laura Niebla</strong> para quienes buscan dirigir su vida y
          negocios con propósito.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/articulos"
            className="w-full rounded-full bg-slate-900 px-8 py-4 text-center text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl sm:w-auto"
          >
            Leer la columna
          </Link>
          <Link
            href="/acerca-de-laura"
            className="w-full rounded-full border border-slate-200 bg-white px-8 py-4 text-center text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 sm:w-auto"
          >
            Conoce a Laura
          </Link>
        </div>
      </section>

      <section className="bg-[#FDFDFD] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-500">
              Lo más reciente
            </p>
            <h2 className="text-balance font-serif text-3xl font-bold text-slate-900 md:text-4xl">
              Reflexiones de esta semana
            </h2>
          </div>

          <ArticleCarousel articles={articles} />

          <div className="mt-12 text-center">
            <Link
              href="/articulos"
              className="text-sm font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900"
            >
              Ver todos los artículos →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
