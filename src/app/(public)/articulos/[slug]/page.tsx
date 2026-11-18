import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CommentsSection from "@/components/CommentsSection";
import { formatDateLong } from "@/lib/format";
import { absoluteUrl, siteName } from "@/lib/site";
import { sanitizeArticleHtml, sanitizePlainText } from "@/lib/security";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  published_at: string;
}

interface Author {
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const getArticle = cache(async (slug: string): Promise<Article | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, content, image_url, published_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  return (data as Article | null) ?? null;
});

const getAuthor = cache(async (): Promise<Author | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, bio, avatar_url")
    .limit(1)
    .maybeSingle();

  return (data as Author | null) ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "Artículo no encontrado" };

  const description = article.excerpt ?? undefined;
  const images = article.image_url
    ? [{ url: article.image_url, alt: article.title }]
    : undefined;

  return {
    title: article.title,
    description,
    alternates: { canonical: `/articulos/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `/articulos/${article.slug}`,
      publishedTime: article.published_at,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.image_url ? [article.image_url] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const supabase = await createSupabaseServerClient();
  const [
    {
      data: { user },
    },
    author,
  ] = await Promise.all([supabase.auth.getUser(), getAuthor()]);

  const isAdmin = Boolean(user);
  const html = sanitizeArticleHtml(article.content ?? "");
  const plainText = sanitizePlainText(article.content ?? "");
  const readingMinutes = Math.max(
    1,
    Math.round(plainText.split(/\s+/).filter(Boolean).length / 200)
  );
  const formattedDate = formatDateLong(article.published_at);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.image_url ? [article.image_url] : undefined,
    datePublished: article.published_at,
    dateModified: article.published_at,
    inLanguage: "es-MX",
    author: {
      "@type": "Person",
      name: author?.full_name ?? "Laura Niebla",
      url: absoluteUrl("/acerca-de-laura"),
    },
    publisher: { "@type": "Organization", name: siteName },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/articulos/${article.slug}`),
    },
  };

  return (
    <article className="min-h-screen bg-[#FDFDFD] py-16 md:py-24">
      <script
        type="application/ld+json"
        // Se escapa "<" para que el contenido del artículo no pueda
        // cerrar la etiqueta script (defensa ante XSS).
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12">
          <Link
            href="/articulos"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <span aria-hidden="true">←</span> Volver a todos los artículos
          </Link>
        </div>

        <header className="mb-12 text-center md:mb-16">
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500">
            <time dateTime={article.published_at}>{formattedDate}</time>
            <span aria-hidden="true"> · </span>
            {readingMinutes} min de lectura
          </p>
          <h1 className="mb-8 text-balance font-serif text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            {article.title}
          </h1>
        </header>
      </div>

      {article.image_url && (
        <div className="mx-auto mb-16 w-full max-w-5xl md:mb-24 md:px-6">
          <div className="relative aspect-video w-full overflow-hidden border border-slate-100 bg-slate-100 shadow-sm md:rounded-3xl">
            <Image
              src={article.image_url}
              alt={`Portada de: ${article.title}`}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl px-6">
        <div
          className="prose prose-lg prose-slate max-w-none break-words text-slate-700 prose-headings:font-serif prose-headings:text-slate-900 prose-a:text-slate-900 prose-a:underline prose-blockquote:border-slate-300 prose-blockquote:text-slate-600 md:prose-xl prose-p:mb-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <hr className="my-10 border-slate-100" />

        {author && (
          <section aria-label="Sobre la autora" className="pb-12">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              {author.avatar_url && (
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-slate-50 shadow-sm">
                  <Image
                    src={author.avatar_url}
                    alt={author.full_name ?? "Autora"}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Escrito por
                </p>
                <h2 className="text-xl font-bold text-slate-900">
                  {author.full_name ?? "Laura Niebla"}
                </h2>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-600">
                  {author.bio ??
                    "Consultora y escritora especializada en liderazgo consciente y desarrollo empresarial."}
                </p>
                <Link
                  href="/acerca-de-laura"
                  className="mt-3 inline-block text-xs font-bold uppercase tracking-widest text-slate-900 underline decoration-2 underline-offset-4 transition-colors hover:text-slate-600"
                >
                  Conoce más sobre mi trayectoria
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="mx-auto max-w-3xl px-6">
        <CommentsSection articleId={article.id} isAdmin={isAdmin} />
      </div>
    </article>
  );
}
