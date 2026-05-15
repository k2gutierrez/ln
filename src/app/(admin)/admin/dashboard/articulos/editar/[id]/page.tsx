'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function EditArticle() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // NUEVO ESTADO: Fecha de publicación
  const [publishedAt, setPublishedAt] = useState('');

  // Configuración del Editor
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

  useEffect(() => {
    if (id) loadArticle();
  }, [id]);

  async function loadArticle() {
    try {
      const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setExcerpt(data.excerpt || '');
        
        const initialContent = data.content?.includes('<p>') ? data.content : `<p>${data.content?.replace(/\n/g, '</p><p>')}</p>`;
        setContent(initialContent);
        setImageUrl(data.image_url || '');

        // CARGAR LA FECHA: Convertimos de ISO a YYYY-MM-DD para el input de tipo date
        if (data.published_at) {
          setPublishedAt(new Date(data.published_at).toISOString().split('T')[0]);
        } else {
          setPublishedAt(new Date().toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      router.push('/admin/dashboard/articulos');
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanContent = content.replace(/&nbsp;|\u00a0/g, ' ');

      let finalImageUrl = imageUrl;
      if (imageFile) {
        const filePath = `articles/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from('media').upload(filePath, imageFile);
        finalImageUrl = supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;
      }

      await supabase.from('articles').update({
        title, 
        slug, 
        excerpt, 
        content: cleanContent, 
        image_url: finalImageUrl,
        // GUARDAR LA FECHA: La regresamos a formato ISO para la base de datos
        published_at: new Date(publishedAt).toISOString()
      }).eq('id', id);

      router.push('/admin/dashboard/articulos');
    } catch (err) {
      alert('Error al actualizar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <Link href="/admin/dashboard/articulos" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">← Volver</Link>
            <h1 className="text-3xl font-bold text-slate-900 mt-2 font-serif">Editar Artículo</h1>
          </div>
          <button onClick={handleSubmit} disabled={saving} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-2xl font-bold border-none focus:ring-0 p-0" />
              <div className="bg-white min-h-[500px]">
                <ReactQuill theme="snow" modules={quillModules} value={content} onChange={setContent} className="h-[500px] mb-12" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            
            {/* NUEVA CARD: Fecha de Publicación */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Fecha</label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full text-sm text-slate-700 font-medium border-slate-200 rounded-xl focus:ring-slate-900 focus:border-slate-900 p-3 bg-slate-50"
              />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-4">Portada</label>
              <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-50 border border-dashed border-slate-200">
                {(imagePreview || imageUrl) && <img src={imagePreview || imageUrl} className="w-full h-full object-cover" />}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Extracto</label>
              <textarea rows={5} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full text-sm text-slate-600 border-none focus:ring-0 p-0 resize-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}