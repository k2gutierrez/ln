'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function NewArticle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // NUEVO ESTADO: Fecha de publicación (Por defecto la de hoy en formato AAAA-MM-DD)
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().split('T')[0]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    setSlug(generateSlug(title));
  }, [title]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';
      const cleanContent = content.replace(/&nbsp;|\u00a0/g, ' ');

      if (imageFile) {
        if (!imageFile.type.startsWith('image/')) {
          toast.error('El archivo debe ser una imagen.');
          return;
        }
        if (imageFile.size > MAX_IMAGE_BYTES) {
          toast.error('La imagen no puede superar los 5 MB.');
          return;
        }

        const fileExt = imageFile.name.split('.').pop() ?? 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `articles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      // Guardar artículo con la fecha elegida
      const { error: dbError } = await supabase
        .from('articles')
        .insert([
          {
            title,
            slug,
            excerpt,
            content: cleanContent,
            image_url: imageUrl,
            is_published: false,
            // Convertimos la fecha del calendario a formato ISO para la base de datos
            published_at: new Date(`${publishedAt}T12:00:00`).toISOString(),
          },
        ]);

      if (dbError) throw dbError;

      toast.success('Artículo guardado como borrador.');
      router.push('/admin/dashboard/articulos');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      const message =
        error && typeof error === 'object' && 'code' in error && error.code === '23505'
          ? 'Ya existe un artículo con esa URL (slug). Cambia el título.'
          : 'Hubo un error al guardar el artículo.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'align': [] }],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/admin/dashboard/articulos" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              ← Cancelar y volver
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mt-2 font-serif">Nuevo Artículo</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !title}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200 w-full sm:w-auto"
          >
            {loading ? 'Guardando...' : 'Guardar como Borrador'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Título del Artículo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: El arte de delegar con propósito"
                  className="w-full text-2xl font-bold border-none focus:ring-0 placeholder:text-slate-200 p-0"
                />
                <p className="text-xs text-slate-500 mt-2 italic">URL: conintencion.com/articulos/{slug}</p>
              </div>

              <hr className="border-slate-100" />

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Contenido</label>
                <div className="bg-white">
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={content}
                    onChange={setContent}
                    placeholder="Escribe tu artículo aquí..."
                    className="h-[600px] mb-12 text-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">

            {/* NUEVA CARD: Fecha de Publicación */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Fecha</label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full text-sm text-slate-700 font-medium border-slate-200 rounded-xl focus:ring-slate-900 focus:border-slate-900 p-3 bg-slate-50"
              />
            </div>

            {/* Card de Imagen */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Portada</label>
              <div className="relative group cursor-pointer">
                {imagePreview ? (
                  <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.preventDefault(); setImagePreview(null); setImageFile(null); }}
                      className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-rose-500 transition-all z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 w-full border-2 border-dashed border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-300 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subir imagen</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Card de Extracto */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Extracto</label>
              <textarea
                rows={5}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Un pequeño texto para captar la atención."
                className="w-full text-sm text-slate-600 border-none focus:ring-0 p-0 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}