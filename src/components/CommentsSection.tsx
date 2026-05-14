'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CommentsSection({ articleId, isAdmin }: { articleId: string, isAdmin: boolean }) {
  const [comments, setComments] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });
    setComments(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ article_id: articleId, user_name: name, content: text }),
    });

    console.log(res)

    if (res.ok) {
      setText('');
      setName('');
      fetchComments();
    } else {
      const err = await res.json();
      alert(err.error);
    }
    setLoading(false);
  }

  async function deleteComment(id: string) {
    if (!confirm('¿Borrar este comentario?')) return;
    await supabase.from('comments').delete().eq('id', id);
    fetchComments();
  }

  return (
    <div className="mt-16 border-t pt-12">
      <h3 className="text-2xl font-bold mb-8">Conversación</h3>
      
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-12 bg-slate-50 p-6 rounded-3xl space-y-4">
        <input 
          placeholder="Tu nombre (opcional)" 
          className="w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-slate-900"
          value={name} onChange={e => setName(e.target.value)}
        />
        <textarea 
          placeholder="Escribe tu opinión..." 
          required
          className="w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-slate-900 h-32"
          value={text} onChange={e => setText(e.target.value)}
        />
        <button 
          disabled={loading}
          className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Publicar Comentario'}
        </button>
      </form>

      {/* Lista de Comentarios */}
      <div className="space-y-6">
        {comments.map((c) => (
          <div key={c.id} className={`p-6 rounded-2xl border ${c.is_admin_reply ? 'bg-slate-900 text-white ml-8' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold">{c.user_name} {c.is_admin_reply && '✓ (Autora)'}</span>
              <span className="text-xs opacity-50">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm leading-relaxed">{c.content}</p>
            
            {isAdmin && (
              <div className="mt-4 flex gap-4">
                <button onClick={() => deleteComment(c.id)} className="text-xs text-rose-500 font-bold uppercase tracking-widest">Borrar</button>
                {!c.is_admin_reply && <button className="text-xs text-slate-400 font-bold uppercase tracking-widest">Responder</button>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}