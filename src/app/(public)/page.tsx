import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ArticleCarousel from '@/components/ArticleCarousel';

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

export const dynamic = 'force-dynamic';

export default async function Home() {

  // 1. Fetch: Frase del Día
  const { data: quoteData } = await supabase
    .from('daily_quotes')
    .select('text')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  
  const dailyQuote: String = quoteData?.text || '';

  // 2. Fetch: Últimos Artículos (Traemos los últimos 5 para el carrusel)
  const { data: articlesData } = await supabase
    .from('articles')
    .select('id, title, excerpt, slug, image_url, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(5);

  const articles = articlesData || [];

  return (
    <div className="flex flex-col">
      
      {/* --- Sección: Frase del Día --- */}
      {dailyQuote && (
        <div className="bg-slate-50 border-b border-slate-100 py-3 px-6 text-center">
          <p className="text-sm md:text-base text-slate-600 italic font-serif tracking-wide">
            "{dailyQuote}"
          </p>
        </div>
      )}

      {/* --- Sección Hero: Perfil de la Columna --- */}
      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-tight font-serif">
          Ideas claras para mentes <br className="hidden md:block" /> que lideran.
        </h1>
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
          Un espacio semanal dedicado a la reflexión empresarial, el liderazgo consciente y el crecimiento personal. Escrito por <strong>Laura Niebla</strong> para quienes buscan dirigir su vida y negocios con propósito.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/articulos" 
            className="bg-slate-900 text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300"
          >
            Leer la columna
          </Link>
          <Link 
            href="/acerca-de-laura" 
            className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-full text-sm font-bold hover:bg-slate-50 transition-all"
          >
            Conoce a Laura
          </Link>
        </div>
      </section>

      {/* --- Sección: Carrusel Interactivo --- */}
      <section className="py-20 bg-[#FDFDFD]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Lo más reciente</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif">Reflexiones de esta semana</h3>
          </div>

          {/* Aquí inyectamos el componente que creamos en el Paso 1 */}
          <ArticleCarousel articles={articles} />
          
          <div className="mt-12 text-center">
             <Link 
              href="/articulos" 
              className="text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
            >
              Ver todos los artículos →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}