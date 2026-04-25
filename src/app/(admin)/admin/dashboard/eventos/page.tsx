'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Evento {
  id: string;
  title: string;
  event_date: string;
  location: string;
}

export default function EventsList() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('id, title, event_date, location')
      .order('event_date', { ascending: true });
    
    setEventos(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Gestión de Eventos</h1>
          </div>
          <Link href="/admin/dashboard/eventos/nuevo" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
            + Nuevo Evento
          </Link>
        </div>

        <div className="grid gap-4">
          {eventos.map(e => (
            <div key={e.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900">{e.title}</h3>
                <p className="text-sm text-slate-500">{new Date(e.event_date).toLocaleDateString()} — {e.location}</p>
              </div>
              <button className="text-rose-500 text-sm font-medium">Eliminar</button>
            </div>
          ))}
          {eventos.length === 0 && !loading && (
            <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
              No tienes eventos programados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}