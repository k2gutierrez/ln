'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function NewEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        const filePath = `events/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from('media').upload(filePath, imageFile);
        imageUrl = supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;
      }

      await supabase.from('events').insert([{
        title,
        event_date: date,
        location,
        registration_link: link,
        description,
        image_url: imageUrl
      }]);

      router.push('/admin/dashboard/eventos');
    } catch (err) {
      alert('Error al guardar el evento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold mb-8">Programar Evento</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Título</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Fecha y Hora</label>
              <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Ubicación (o link de Zoom)</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} required className="w-full p-3 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Link de Registro</label>
            <input type="url" value={link} onChange={e => setLink(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Póster del Evento</label>
            <input type="file" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full p-3" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">
            {loading ? 'Guardando...' : 'Publicar Evento'}
          </button>
        </form>
      </div>
    </div>
  );
}