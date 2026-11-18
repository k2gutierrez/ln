"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface EventRecord {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
}

export default function EventsList() {
  const [eventos, setEventos] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_date, location")
      .order("event_date", { ascending: true });

    if (error) {
      toast.error("No se pudieron cargar los eventos.");
    } else {
      setEventos((data as EventRecord[]) ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function deleteEvent(event: EventRecord) {
    if (!window.confirm(`¿Eliminar el evento «${event.title}»?`)) return;

    setDeletingId(event.id);
    const { error } = await supabase.from("events").delete().eq("id", event.id);

    if (error) {
      toast.error("No se pudo eliminar el evento.");
    } else {
      setEventos((current) => current.filter((item) => item.id !== event.id));
      toast.success("Evento eliminado.");
    }

    setDeletingId(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              ← Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Gestión de Eventos
            </h1>
          </div>
          <Link
            href="/admin/dashboard/eventos/nuevo"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            + Nuevo evento
          </Link>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              Cargando eventos...
            </div>
          ) : (
            eventos.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-bold text-slate-900">{event.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(event.event_date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {event.location ? ` — ${event.location}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteEvent(event)}
                  disabled={deletingId === event.id}
                  className="self-start text-sm font-medium text-rose-500 transition-colors hover:text-rose-600 disabled:opacity-50 sm:self-auto"
                >
                  {deletingId === event.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            ))
          )}

          {!loading && eventos.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
              No tienes eventos programados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
