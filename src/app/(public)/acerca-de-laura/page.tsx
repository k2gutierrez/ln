import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeExternalUrl } from "@/lib/security";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Sobre Laura",
  description:
    "Conoce a Laura Niebla: consultora, conferencista y autora de ConIntención, especializada en liderazgo consciente y desarrollo empresarial.",
  alternates: { canonical: "/acerca-de-laura" },
  openGraph: {
    title: "Sobre Laura | ConIntención",
    description:
      "Consultora, conferencista y autora especializada en liderazgo consciente.",
    url: "/acerca-de-laura",
  },
};

interface Profile {
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
}

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800";

export default async function AboutPage() {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("profiles")
    .select("full_name, bio, avatar_url, linkedin_url, instagram_url")
    .limit(1)
    .maybeSingle();

  const profile = (data as Profile | null) ?? null;

  const fullName = profile?.full_name ?? "Laura Niebla";
  const bio =
    profile?.bio ??
    "Escritora y consultora enfocada en el liderazgo consciente.";
  const avatarUrl = profile?.avatar_url || FALLBACK_AVATAR;
  const linkedinUrl = safeExternalUrl(profile?.linkedin_url);
  const instagramUrl = safeExternalUrl(profile?.instagram_url);

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-24">
          <div className="lg:w-1/3">
            <div className="sticky top-32">
              <div className="relative mx-auto mb-8 h-48 w-48 md:h-64 md:w-64 lg:mx-0">
                <Image
                  src={avatarUrl}
                  alt={`Fotografía de ${fullName}`}
                  fill
                  sizes="256px"
                  className="rounded-full border-4 border-white object-cover shadow-lg shadow-slate-200/50"
                  priority
                />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-slate-100" />
              </div>

              <div className="text-center lg:text-left">
                <h1 className="mb-2 text-balance font-serif text-3xl font-bold tracking-tight text-slate-900">
                  {fullName}
                </h1>
                <p className="mb-8 text-sm font-bold uppercase tracking-widest text-slate-500">
                  Autora de Con Intención
                </p>

                <div className="flex justify-center gap-4 lg:justify-start">
                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-slate-50 p-3 text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      aria-label="Perfil de LinkedIn"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-slate-50 p-3 text-slate-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
                      aria-label="Perfil de Instagram"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="prose prose-lg max-w-none prose-p:leading-relaxed prose-p:text-slate-600 md:prose-xl">
              <div className="whitespace-pre-wrap font-serif">{bio}</div>
            </div>

            <hr className="my-12 border-slate-100" />

            <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-100 bg-slate-50 p-8 text-center md:p-10 lg:flex-row lg:text-left">
              <div>
                <h2 className="mb-2 text-xl font-bold text-slate-900">
                  Lee mi columna semanal
                </h2>
                <p className="text-sm text-slate-500">
                  Explora mis reflexiones sobre liderazgo y crecimiento
                  personal.
                </p>
              </div>
              <Link
                href="/articulos"
                className="whitespace-nowrap rounded-full bg-slate-900 px-8 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                Ver todos los artículos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
