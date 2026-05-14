import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { article_id, user_name, content } = await req.json();

    // 1. LIMPIEZA DE SEGURIDAD (Eliminar HTML, Scripts y Links)
    const cleanContent = content
      .replace(/<[^>]*>?/gm, '') // Elimina etiquetas HTML/Código
      .replace(/(https?:\/\/[^\s]+)/g, '[enlace eliminado]') // Bloquea links
      .trim();

    if (cleanContent.length < 3) return NextResponse.json({ error: 'Comentario muy corto' }, { status: 400 });

    // 2. MODERACIÓN CON IA
    const moderation = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un moderador de comentarios. Responde únicamente con la palabra SAFE o UNSAFE. Un comentario es UNSAFE si contiene odio, insultos, contenido ofensivo, negatividad extrema o es spam.'
        },
        { role: 'user', content: cleanContent }
      ],
      temperature: 0,
    });

    const isSafe = moderation.choices[0].message.content === 'SAFE';

    if (!isSafe) {
      return NextResponse.json({ error: 'El contenido no cumple con las normas de la comunidad.' }, { status: 400 });
    }

    // 3. GUARDAR EN SUPABASE
    const { data, error } = await supabase
      .from('comments')
      .insert({
        article_id,
        user_name: user_name || 'Anónimo',
        content: cleanContent
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar el comentario' }, { status: 500 });
  }
}