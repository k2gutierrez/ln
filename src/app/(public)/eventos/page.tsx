import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Forzamos la actualización dinámica en el servidor
export const revalidate = 0;

export default async function EventsPage() {
  // Obtenemos todos los eventos ordenados por fecha ascendente
  const { data: eventos, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  // Si no hay datos o hay error, inicializamos como arreglo vacío
  const todosLosEventos = eventos || [];

  // Lógica de separación: Próximos vs Pasados
  const hoy = new Date();
  
  const proximosEventos = todosLosEventos.filter((evento) => new Date(evento.event_date) >= hoy);
  // Invertimos el orden de los pasados para que el más reciente salga primero
  const eventosPasados = todosLosEventos.filter((evento) => new Date(evento.event_date) < hoy).reverse();

  // Función auxiliar para formatear la fecha y hora
  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    const diaMesAnio = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${diaMesAnio} • ${hora} hrs`;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Cabecera de la Página */}
        <header className="mb-16 md:mb-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-6">
            Espacios de encuentro
          </h1>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Acompáñame en conferencias, talleres y sesiones de reflexión. Un espacio para conectar y profundizar en el liderazgo con intención.
          </p>
        </header>

        {/* Sección: Próximos Eventos */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            Próximos eventos
          </h2>

          <div className="space-y-8">
            {proximosEventos.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center">
                <p className="text-slate-500">Actualmente no hay eventos programados. Suscríbete a la columna para enterarte de las próximas fechas.</p>
              </div>
            ) : (
              proximosEventos.map((evento) => (
                <article key={evento.id} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm hover:shadow-md transition-shadow">
                  {/* Imagen del Evento */}
                  <div className="w-full md:w-1/3 aspect-video md:aspect-square relative rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <Image 
                      src={evento.image_url || 'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800'} 
                      alt={`Póster de ${evento.title}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Detalles del Evento */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">
                      {formatearFecha(evento.event_date)}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
                      {evento.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {evento.location}
                    </div>
                    {evento.description && (
                      <p className="text-slate-600 leading-relaxed mb-8 line-clamp-3">
                        {evento.description}
                      </p>
                    )}
                    
                    {/* Botón de Registro */}
                    {evento.registration_link && (
                      <div className="mt-auto">
                        <a 
                          href={evento.registration_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                        >
                          Registrarse / Más información
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Sección: Eventos Pasados (Historial) */}
        {eventosPasados.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-400 mb-8 border-t border-slate-100 pt-8">
              Eventos anteriores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventosPasados.map((evento) => (
                <div key={evento.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 opacity-75 hover:opacity-100 transition-opacity flex flex-col">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    {new Date(evento.event_date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug">
                    {evento.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">{evento.location}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}