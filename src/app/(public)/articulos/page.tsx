import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Forzamos la actualización dinámica en el servidor
export const revalidate = 0;

export default async function AllArticlesPage() {
  // Consultamos TODOS los artículos, pero estrictamente solo los publicados
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, excerpt, slug, image_url, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const publicados = articles || [];

  // Función auxiliar para formatear la fecha
  const formatearFecha = (fechaString: string) => {
    return new Date(fechaString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Cabecera de la Biblioteca */}
        <header className="mb-16 md:mb-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-6">
            La Columna
          </h1>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Explora todas las reflexiones semanales sobre liderazgo consciente, crecimiento personal y dirección empresarial.
          </p>
        </header>

        {/* Cuadrícula de Artículos */}
        {publicados.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-16 text-center max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto text-slate-300 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Aún no hay publicaciones</h2>
            <p className="text-slate-500">Los artículos publicados por Laura aparecerán en este espacio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {publicados.map((article) => (
              <article 
                key={article.id} 
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <Link href={`/articulos/${article.slug}`} className="block relative h-60 w-full overflow-hidden bg-slate-100">
                  <Image 
                    src={article.image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800'} 
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                </Link>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 font-bold uppercase tracking-widest">
                    <time dateTime={article.published_at}>{formatearFecha(article.published_at)}</time>
                  </div>
                  
                  <Link href={`/articulos/${article.slug}`}>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-snug group-hover:text-slate-600 transition-colors">
                      {article.title}
                    </h2>
                  </Link>
                  
                  <p className="text-slate-600 leading-relaxed mb-8 flex-grow line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-100">
                    <Link 
                      href={`/articulos/${article.slug}`}
                      className="text-sm font-bold text-slate-900 inline-flex items-center gap-2 group-hover:gap-3 transition-all"
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