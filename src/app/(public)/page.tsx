import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

// Tipado para TypeScript basado en nuestras tablas
interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  image_url: string;
  published_at: string;
}

// Función auxiliar para formatear la fecha a español
const formatearFecha = (fechaString: string) => {
  const opciones: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  };
  return new Date(fechaString).toLocaleDateString('es-ES', opciones);
};

export default async function Home() {
  
  // 1. Fetch: Frase del Día
  // Traemos la frase más reciente que esté marcada como 'is_active'
  const { data: quoteData } = await supabase
    .from('daily_quotes')
    .select('text')
    .order('created_at', { ascending: false }) // La más nueva primero
    .limit(1) // Solo queremos una
    .maybeSingle();

    console.log(quoteData)

  // 2. Fetch: Últimos Artículos
  // Traemos los 5 artículos más recientes que estén publicados
  const { data: articlesData } = await supabase
    .from('articles')
    .select('id, title, excerpt, slug, image_url, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(5);

  const articles: Article[] = articlesData || [];

  return (
    <div className="flex flex-col">
      
      {/* --- Nueva Sección: Frase del Día --- */}
      {quoteData && (
        <div className="bg-slate-50 border-b border-slate-100 py-3 px-6 text-center">
          <p className="text-sm md:text-base text-slate-600 italic font-serif">
            "{quoteData.text}"
          </p>
        </div>
      )}

      {/* --- Sección Hero: Perfil de la Columna --- */}
      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
          Ideas claras para mentes <br className="hidden md:block" /> que lideran.
        </h1>
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
          Un espacio semanal dedicado a la reflexión empresarial, el liderazgo consciente y el crecimiento personal. Escrito por <strong>Laura Niebla</strong> para quienes buscan dirigir su vida y sus negocios con verdadero propósito.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/articulos" 
            className="bg-slate-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
          >
            Leer la columna
          </Link>
          <Link 
            href="/acerca-de-laura" 
            className="bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-full text-sm font-medium hover:bg-slate-50 transition-all"
          >
            Conoce a Laura
          </Link>
        </div>
      </section>

      {/* --- Sección: Carrusel de Últimos Artículos --- */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Últimas publicaciones</h2>
              <p className="text-slate-500 mt-2">Reflexiones de esta semana.</p>
            </div>
            <Link href="/articulos" className="hidden md:block text-sm font-medium text-slate-900 hover:underline underline-offset-4">
              Ver todos →
            </Link>
          </div>

          {/* Renderizado condicional si no hay artículos */}
          {articles.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
              Próximamente nuevos artículos.
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
              {articles.map((article) => (
                <Link 
                  href={`/articulos/${article.slug}`} 
                  key={article.id}
                  className="min-w-[300px] md:min-w-[400px] bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex-shrink-0 snap-start overflow-hidden group border border-slate-100 cursor-pointer text-left flex flex-col"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    {/* Se usa una imagen por defecto temporal en caso de que un artículo no tenga portada aún */}
                    <Image 
                      src={article.image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800'} 
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider">
                      <span>{formatearFecha(article.published_at)}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 leading-snug group-hover:text-slate-700 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-slate-600 line-clamp-3 leading-relaxed text-sm mb-6 flex-grow">
                      {article.excerpt}
                    </p>
                    <div className="text-sm font-medium text-slate-900 mt-auto flex items-center gap-2">
                      Leer artículo <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="mt-6 md:hidden text-center">
             <Link href="/articulos" className="text-sm font-medium text-slate-900 hover:underline underline-offset-4">
              Ver todos los artículos →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}