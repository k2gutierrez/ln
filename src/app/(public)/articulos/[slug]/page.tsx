import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import CommentsSection from '@/components/CommentsSection';

// Soporte para Next.js 15 (params como Promesa)
export default async function ArticlePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  // 1. Resolvemos el slug de la URL
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 2. Buscamos el artículo. Usamos .maybeSingle() para evitar colapsos
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  // Si no hay artículo o hay error de red, mostramos el 404
  if (error || !article) {
    if (error) console.error("Error de Supabase:", error.message);
    notFound();
  }

  // 3. Buscamos el perfil de la autora para la tarjeta del final
  const { data: author } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .limit(1)
    .maybeSingle();

  // 4. Formatear la fecha para que sea elegante
  const formattedDate = new Date(article.published_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Al final del archivo page.tsx del slug
  const { data: { session } } = await supabase.auth.getSession();
  const isAdmin = !!session;

  return (
    <article className="min-h-screen bg-[#FDFDFD] py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">

        {/* --- CABECERA --- */}
        <div className="mb-12">
          <Link
            href="/articulos"
            className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors inline-flex items-center gap-2"
          >
            <span>←</span> Volver a todos los artículos
          </Link>
        </div>

        <header className="mb-12 md:mb-16 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            {formattedDate}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-8">
            {article.title}
          </h1>
          
        </header>
      </div>

      {/* --- IMAGEN DE PORTADA --- */}
      {article.image_url && (
        <div className="w-full max-w-5xl mx-auto px-0 md:px-6 mb-16 md:mb-24">
          <div className="relative aspect-video w-full overflow-hidden md:rounded-3xl bg-slate-100 shadow-sm border border-slate-100">
            <Image
              src={article.image_url}
              alt={`Portada de: ${article.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* --- CUERPO DEL ARTÍCULO --- */}
      <div className="max-w-3xl mx-auto px-6 w-full">

        <div
          className="prose prose-lg md:prose-xl prose-slate mx-auto justify
             text-slate-700 leading-relaxed break-words 
             /* Redujimos el margen de mb-8 a mb-5 para que sea más sutil */
             prose-p:mb-5 
             prose-headings:text-slate-900 prose-headings:font-bold"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />
        {/* NOTA: En la clase de arriba he quitado 'hyphens-auto' y 'break-words'.
            Esto solucionará el problema de los guiones al final de las líneas que mostrabas. */}

        <hr className="my-8 border-slate-100" />

        {/* --- TARJETA DE AUTORA (Al final y alineada a la derecha) --- */}
        {author && (
          <div className="flex justify-end pb-12">
            <div className="max-w-md bg-white p-8 rounded-3xl  flex flex-col items-center md:items-end text-center md:text-right gap-4">
              <div className="flex items-center gap-4 flex-col md:flex-row-reverse">

                {/* AQUI ESTÁ LA IMAGEN CIRCULAR */}
                {author.avatar_url && (
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={author.avatar_url}
                      alt={author.full_name || 'Autora'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="rounded-full object-cover border-2 border-slate-50 shadow-sm"
                    />
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Escrito por</p>
                  <h3 className="text-xl font-bold text-slate-900">{author.full_name || 'Laura Niebla'}</h3>
                </div>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed italic">
                "{author.bio || 'Consultora y escritora especializada en liderazgo consciente y desarrollo empresarial.'}"
              </p>

              <Link
                href="/acerca-de-laura"
                className="text-xs font-bold uppercase tracking-tighter text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-all mt-2"
              >
                Conoce más sobre mi trayectoria
              </Link>
            </div>
          </div>
        )}

      </div>
      <div className="max-w-3xl mx-auto px-6">
        <CommentsSection articleId={article.id} isAdmin={isAdmin} />
      </div>
    </article>
  );
}