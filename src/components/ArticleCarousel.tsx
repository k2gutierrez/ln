"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDateShort } from "@/lib/format";

export interface CarouselArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  image_url: string;
  published_at: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800";

export default function ArticleCarousel({
  articles,
}: {
  articles: CarouselArticle[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const total = articles.length;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      setCurrentIndex(((index % total) + total) % total);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Autoplay: se pausa al pasar el mouse, al enfocar o al tocar.
  useEffect(() => {
    if (total <= 1 || isPaused || reducedMotion) return;
    const timer = window.setInterval(goNext, 7000);
    return () => window.clearInterval(timer);
  }, [total, isPaused, reducedMotion, goNext]);

  if (total === 0) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white py-12 text-center text-slate-500">
        Próximamente nuevos artículos.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Artículos recientes"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
          setIsPaused(true);
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          setIsPaused(false);
          if (!start || total <= 1) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) goNext();
            else goPrev();
          }
        }}
      >
        {/* Todas las diapositivas comparten celda: la tarjeta crece con
            la más alta y ningún contenido queda recortado. */}
        <div className="grid">
          {articles.map((article, index) => {
            const isActive = index === currentIndex;

            return (
              <div
                key={article.id}
                aria-hidden={!isActive}
                className={`col-start-1 row-start-1 transition-opacity duration-700 ease-in-out ${
                  isActive
                    ? "z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                }`}
              >
                <div className="flex h-full flex-col md:flex-row">
                  <div className="relative h-56 w-full shrink-0 bg-slate-100 md:h-auto md:min-h-[420px] md:w-1/2">
                    <Image
                      src={article.image_url || FALLBACK_IMAGE}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>

                  <div className="flex w-full flex-1 flex-col justify-center bg-white p-6 sm:p-8 md:w-1/2 md:flex-none md:p-12">
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                      {formatDateShort(article.published_at)}
                    </p>

                    <h3 className="mb-4 font-serif text-2xl font-bold leading-tight text-slate-900 text-balance md:text-3xl">
                      {article.title}
                    </h3>

                    <p className="mb-6 line-clamp-3 leading-relaxed text-slate-600">
                      {article.excerpt}
                    </p>

                    <div className="mt-auto">
                      <Link
                        href={`/articulos/${article.slug}`}
                        tabIndex={isActive ? 0 : -1}
                        className="inline-flex items-center gap-2 border-b-2 border-slate-900 pb-1 text-sm font-bold text-slate-900 transition-all hover:border-slate-500 hover:text-slate-500"
                      >
                        Leer artículo completo <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Artículo anterior"
              className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-900 shadow-md backdrop-blur transition-colors hover:bg-white md:flex"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Artículo siguiente"
              className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-900 shadow-md backdrop-blur transition-colors hover:bg-white md:flex"
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </div>

      {/* Puntos fuera de la tarjeta: ya no chocan con el enlace y cada
          uno tiene un área táctil de 44 × 44 px. */}
      {total > 1 && (
        <div className="mt-5 flex items-center justify-center">
          {articles.map((article, index) => (
            <button
              key={article.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir al artículo ${index + 1} de ${total}`}
              aria-current={index === currentIndex ? "true" : undefined}
              className="group flex h-11 w-11 items-center justify-center rounded-full"
            >
              <span
                className={`block h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-7 bg-slate-900"
                    : "w-2.5 bg-slate-300 group-hover:bg-slate-400"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
