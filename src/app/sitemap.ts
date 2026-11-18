import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const staticRoutes: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: absoluteUrl("/articulos"), changeFrequency: "weekly", priority: 0.9 },
  { url: absoluteUrl("/eventos"), changeFrequency: "monthly", priority: 0.6 },
  {
    url: absoluteUrl("/acerca-de-laura"),
    changeFrequency: "monthly",
    priority: 0.6,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return staticRoutes;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map(
    (article) => ({
      url: absoluteUrl(`/articulos/${article.slug}`),
      lastModified: new Date(article.published_at),
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  return [...staticRoutes, ...articleRoutes];
}
