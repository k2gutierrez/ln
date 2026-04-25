'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados del perfil
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Estados de la imagen a subir
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Cargar datos actuales del perfil
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            setFullName(data.full_name || '');
            setBio(data.bio || '');
            setLinkedinUrl(data.linkedin_url || '');
            setInstagramUrl(data.instagram_url || '');
            setAvatarUrl(data.avatar_url || null);
          }
        }
      } catch (error) {
        console.error('Error cargando el perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Manejar previsualización de imagen circular
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      let finalAvatarUrl = avatarUrl;

      // 1. Si hay una nueva imagen, la subimos
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        finalAvatarUrl = data.publicUrl;
      }

      // 2. Guardar (Upsert) los datos en la tabla profiles
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Esto es crucial para enlazarlo a su cuenta de Supabase
          full_name: fullName,
          bio: bio,
          linkedin_url: linkedinUrl,
          instagram_url: instagramUrl,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      alert('¡Perfil actualizado con éxito!');
      // Actualizamos el estado de la imagen actual por si no recarga la página
      setAvatarUrl(finalAvatarUrl);
      setImageFile(null); 
      setImagePreview(null);

    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al guardar tu perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Cargando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              ← Volver al Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mt-2 font-serif">Perfil de Autora</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !fullName}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </header>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-10">
          
          {/* Sección de Imagen Circular */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-slate-50 overflow-hidden shadow-md bg-slate-100 flex items-center justify-center">
                {(imagePreview || avatarUrl) ? (
                  <img 
                    src={imagePreview || avatarUrl!} 
                    alt="Perfil" 
                    className="w-full h-full object-cover aspect-square"
                  />
                ) : (
                  <span className="text-slate-400 text-sm font-medium">Sin foto</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-slate-900 text-white p-3 rounded-full cursor-pointer shadow-lg hover:bg-slate-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Tu fotografía</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Esta imagen aparecerá en la página pública y en el pie de tus artículos. Se recortará de manera circular automáticamente.
              </p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Formulario de Datos Personales */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Nombre para mostrar</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Laura Niebla"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Biografía</label>
              <textarea
                rows={6}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Escribe un poco sobre tu trayectoria, tu misión y lo que compartes en ConIntención..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700 leading-relaxed resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">URL de LinkedIn</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/tu-perfil"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">URL de Instagram</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/tu_usuario"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-slate-700 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}