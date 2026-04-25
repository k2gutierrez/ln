import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Importamos tu conexión a la BD
import OpenAI from 'openai'; // Suponiendo que usas OpenAI

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { promptUsuario } = await req.json();

    // 1. OBTENER EL CONTEXTO AUTOMÁTICAMENTE DESDE SUPABASE
    // Traemos los 2 últimos artículos publicados para que la IA copie el estilo
    const { data: ultimosArticulos, error } = await supabase
      .from('articles')
      .select('title, content')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(2);

    // 2. LIMPIAR Y PREPARAR LOS ARTÍCULOS DE REFERENCIA
    let ejemplosDeEstilo = "";
    if (ultimosArticulos && ultimosArticulos.length > 0) {
      ejemplosDeEstilo = "\n\nAquí tienes ejemplos de cómo escribe Laura normalmente:\n";
      
      ultimosArticulos.forEach((art, index) => {
        // Un pequeño truco para limpiar las etiquetas HTML (<p>, <br>) y dejar solo el texto
        const textoLimpio = art.content.replace(/<[^>]+>/g, ''); 
        ejemplosDeEstilo += `--- EJEMPLO ${index + 1}: ${art.title} ---\n${textoLimpio}\n\n`;
      });
    }

    // 3. CONSTRUIR EL PROMPT DE SISTEMA DINÁMICO
    const SYSTEM_PROMPT = `
      Eres el asistente de redacción exclusivo de Laura Niebla, fundadora de 'ConIntención'.
      Tu objetivo es imitar su voz literaria a la perfección.
      Su estilo es reflexivo, elegante, empático e invita a la introspección. Habla de liderazgo consciente.
      Habla en primera persona. Usa párrafos cortos.
      ${ejemplosDeEstilo}
      Basándote estrictamente en el estilo de los ejemplos anteriores, cumple con la siguiente solicitud.
    `;

    // 4. LLAMAR A LA IA
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', 
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptUsuario }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ text: response.choices[0].message.content });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error procesando la IA' }, { status: 500 });
  }
}