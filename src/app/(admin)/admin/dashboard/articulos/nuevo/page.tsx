'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Importamos el editor de forma dinámica para que no cause errores con el servidor de Next.js
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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

  // Función para convertir título en Slug amigable para URL
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      // 1. Normalizar: Separa los acentos de las letras (é -> e + ´)
      .normalize('NFD')
      // 2. Eliminar los acentos (los "diacríticos")
      .replace(/[\u0300-\u036f]/g, '')
      // 3. Reemplazar la ñ por n (opcional, pero recomendado para URLs)
      .replace(/ñ/g, 'n')
      // 4. Quitar caracteres especiales que no sean letras, números o espacios
      .replace(/[^a-z0-9\s-]/g, '')
      // 5. Reemplazar espacios y guiones bajos por guiones normales
      .replace(/[\s_-]+/g, '-')
      // 6. Eliminar guiones al principio o al final
      .replace(/^-+|-+$/g, '');
  };

  // Actualizar slug cuando cambie el título
  useEffect(() => {
    setSlug(generateSlug(title));
  }, [title]);

  // Manejar previsualización de imagen
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

      // 1. Subir imagen si existe
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `articles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      // 2. Guardar artículo en la base de datos
      const { error: dbError } = await supabase
        .from('articles')
        .insert([
          {
            title,
            slug,
            excerpt,
            content: cleanContent,
            image_url: imageUrl,
            is_published: false, // Se guarda como borrador por defecto
          },
        ]);

      if (dbError) throw dbError;

      router.push('/admin/dashboard/articulos');
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al guardar el artículo.');
    } finally {
      setLoading(false);
    }
  };

  // Configuración de la barra de herramientas del editor
  const quillModules = {
    toolbar: [
      [{ 'header': [2, 3, false] }], // Permite poner Subtítulos (H2, H3) o texto normal
      ['bold', 'italic', 'underline', 'strike', 'blockquote'], // Negritas, cursivas, citas
      [{ 'align': [] }], // <--- ADD THIS LINE HERE
      [{'list': 'ordered'}, {'list': 'bullet'}], // Listas numeradas y con viñetas
      ['link'], // Agregar enlaces a otras páginas
      ['clean'] // Botón para borrar el formato si se copia y pega algo feo
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <Link href="/admin/dashboard/articulos" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              ← Cancelar y volver
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mt-2 font-serif">Nuevo Artículo</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !title}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
          >
            {loading ? 'Guardando...' : 'Guardar como Borrador'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Columna Principal: Contenido (Ahora ocupa 3 columnas, dándole mucho más espacio) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Título del Artículo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: El arte de delegar con propósito"
                  className="w-full text-2xl font-bold border-none focus:ring-0 placeholder:text-slate-200 p-0"
                />
                <p className="text-xs text-slate-400 mt-2 italic">URL: conintencion.com/articulos/{slug}</p>
              </div>

              <hr className="border-slate-100" />

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Contenido</label>
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

          {/* Columna Lateral: Metadatos e Imagen (Ahora ocupa solo 1 columna, más estrecha) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card de Imagen */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Portada</label>
              <div className="relative group cursor-pointer">
                {/* Cambié la altura de h-48 a h-36 para que sea un cuadro más pequeño y manejable */}
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subir imagen</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Card de Extracto */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Extracto</label>
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