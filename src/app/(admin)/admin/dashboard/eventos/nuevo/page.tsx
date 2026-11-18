"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function NewEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        if (!imageFile.type.startsWith("image/")) {
          toast.error("El archivo debe ser una imagen.");
          return;
        }
        if (imageFile.size > MAX_IMAGE_BYTES) {
          toast.error("La imagen no puede superar los 5 MB.");
          return;
        }

        const fileExt = imageFile.name.split(".").pop() ?? "jpg";
        const filePath = `events/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        imageUrl = supabase.storage.from("media").getPublicUrl(filePath).data
          .publicUrl;
      }

      const { error } = await supabase.from("events").insert([
        {
          title,
          event_date: new Date(date).toISOString(),
          location,
          registration_link: link || null,
          description: description || null,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      toast.success("Evento publicado.");
      router.push("/admin/dashboard/eventos");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar el evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <Link
          href="/admin/dashboard/eventos"
          className="text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          ← Volver a eventos
        </Link>

        <h1 className="mb-8 mt-2 text-2xl font-bold text-slate-900">
          Programar Evento
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="event-title"
                className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Título
              </label>
              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={160}
                className="w-full rounded-xl border border-slate-200 p-3 text-slate-900"
              />
            </div>
            <div>
              <label
                htmlFor="event-date"
                className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Fecha y hora
              </label>
              <input
                id="event-date"
                type="datetime-local"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 p-3 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="event-location"
              className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500"
            >
              Ubicación (o link de Zoom)
            </label>
            <input
              id="event-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={200}
              className="w-full rounded-xl border border-slate-200 p-3 text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="event-link"
              className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500"
            >
              Link de registro
            </label>
            <input
              id="event-link"
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 p-3 text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="event-description"
              className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500"
            >
              Descripción
            </label>
            <textarea
              id="event-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-slate-200 p-3 text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="event-image"
              className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500"
            >
              Póster del evento (opcional, máx. 5 MB)
            </label>
            <input
              id="event-image"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageFile(event.target.files ? event.target.files[0] : null)
              }
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Publicar evento"}
          </button>
        </form>
      </div>
    </div>
  );
}
