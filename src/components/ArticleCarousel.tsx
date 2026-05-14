'use client'; // ¡Muy importante! Le dice a Next.js que este código usa interactividad

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Tipado para TypeScript
interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  image_url: string;
  published_at: string;
}

const formatearFecha = (fechaString: string) => {
  const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(fechaString).toLocaleDateString('es-ES', opciones);
};

export default function ArticleCarousel({ articles }: { articles: Article[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Lógica para que gire en automático cada 5 segundos
  useEffect(() => {
    if (articles.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === articles.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [articles.length, isPaused]);

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-white rounded-3xl border border-slate-100">
        Próximamente nuevos artículos.
      </div>
    );
  }

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)} // Pausa el carrusel si el usuario pone el mouse encima
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[500px] md:h-[450px]">
        {articles.map((article, index) => (
          <div
            key={article.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="flex flex-col md:flex-row h-full">
              
              {/* Mitad Izquierda: Imagen (Ya no se verá gigante) */}
              <div className="relative w-full md:w-1/2 h-56 md:h-full bg-slate-100">
                <Image 
                  src={article.image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800'} 
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>

              {/* Mitad Derecha: Contenido del Artículo */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 font-bold uppercase tracking-widest">
                  <span>{formatearFecha(article.published_at)}</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight font-serif">
                  {article.title}
                </h3>
                
                <p className="text-slate-600 line-clamp-3 leading-relaxed mb-8">
                  {article.excerpt}
                </p>
                
                <div className="mt-auto">
                  <Link 
                    href={`/articulos/${article.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-all"
                  >
                    Leer artículo completo <span>→</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Controles de "Puntitos" en la parte inferior */}
      {articles.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-slate-900 w-8' : 'bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Ir al artículo ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}