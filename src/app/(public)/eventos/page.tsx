import type { Metadata } from "next";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";
import { safeExternalUrl } from "@/lib/security";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Conferencias, talleres y sesiones de reflexión de Laura Niebla sobre liderazgo con intención.",
  alternates: { canonical: "/eventos" },
  openGraph: {
    title: "Espacios de encuentro | ConIntención",
    description:
      "Conferencias, talleres y sesiones de reflexión sobre liderazgo con intención.",
    url: "/eventos",
  },
};

interface EventRecord {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  registration_link: string | null;
  description: string | null;
  image_url: string | null;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800";

export default async function EventsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  const allEvents = (events ?? []) as EventRecord[];
  const now = new Date();
  const upcoming = allEvents.filter((event) => new Date(event.event_date) >= now);
  const past = allEvents
    .filter((event) => new Date(event.event_date) < now)
    .reverse();

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-16 text-center md:mb-24">
          <h1 className="mb-6 text-balance font-serif text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Espacios de encuentro
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            Acompáñame en conferencias, talleres y sesiones de reflexión. Un
            espacio para conectar y profundizar en el liderazgo con intención.
          </p>
        </header>

        <section className="mb-20">
          <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-slate-900">
            <span
              className="h-3 w-3 animate-pulse rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Eventos
          </h2>

          <div className="space-y-8">
            {upcoming.length === 0 ? (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-12 text-center">
                <p className="text-slate-500">
                  Actualmente no hay eventos programados. Suscríbete a la
                  columna para enterarte de las próximas fechas.
                </p>
              </div>
            ) : (
              upcoming.map((event) => {
                const registrationUrl = safeExternalUrl(event.registration_link);

                return (
                  <article
                    key={event.id}
                    className="flex flex-col gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:flex-row md:p-8"
                  >
                    <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:aspect-square md:w-1/3">
                      <Image
                        src={event.image_url || FALLBACK_IMAGE}
                        alt={`Póster de ${event.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-center">
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">
                        {formatDateTime(event.event_date)}
                      </p>
                      <h3 className="mb-3 text-balance text-2xl font-bold leading-tight text-slate-900">
                        {event.title}
                      </h3>

                      {event.location && (
                        <p className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-5 w-5"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                            />
                          </svg>
                          {event.location}
                        </p>
                      )}

                      {event.description && (
                        <p className="mb-8 line-clamp-3 leading-relaxed text-slate-600">
                          {event.description}
                        </p>
                      )}

                      {registrationUrl && (
                        <div className="mt-auto">
                          <a
                            href={registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
                          >
                            Registrarse / Más información
                          </a>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="mb-8 border-t border-slate-100 pt-8 text-xl font-bold text-slate-600">
              Eventos anteriores
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {past.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-6 opacity-80 transition-opacity hover:opacity-100"
                >
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    {new Date(event.event_date).toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="mb-2 text-lg font-bold leading-snug text-slate-800">
                    {event.title}
                  </h3>
                  {event.location && (
                    <p className="text-sm text-slate-500">{event.location}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
