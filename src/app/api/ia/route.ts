import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isSameOrigin, readJsonBody } from "@/lib/security";

export const runtime = "nodejs";

const MAX_PROMPT_LENGTH = 4000;

interface RequestBody {
  prompt?: unknown;
  promptUsuario?: unknown;
  type?: unknown;
  wordCount?: unknown;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return jsonError("Origen no permitido.", 403);
    }

    // Solo la administradora autenticada puede usar el asistente.
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError("No autorizado. Inicia sesión para usar el asistente.", 401);
    }

    const userLimit = rateLimit(`ia:user:${user.id}`, 15, 60 * 60 * 1000);
    if (!userLimit.ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(userLimit.retryAfter) } }
      );
    }

    const ipLimit = rateLimit(`ia:ip:${getClientIp(request)}`, 30, 60 * 60 * 1000);
    if (!ipLimit.ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
      );
    }

    const body = await readJsonBody<RequestBody>(request, 12_000);
    if (!body) return jsonError("Solicitud inválida.", 400);

    const rawPrompt =
      typeof body.prompt === "string"
        ? body.prompt
        : typeof body.promptUsuario === "string"
          ? body.promptUsuario
          : "";

    const prompt = rawPrompt.trim();

    if (prompt.length < 3) {
      return jsonError("Describe qué necesitas (mínimo 3 caracteres).", 400);
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return jsonError("El texto es demasiado largo.", 400);
    }

    const mode = body.type === "draft" ? "draft" : "ideas";
    const requestedWords =
      typeof body.wordCount === "number" && Number.isFinite(body.wordCount)
        ? Math.min(Math.max(Math.round(body.wordCount), 200), 1500)
        : 500;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonError("Falta configurar OPENAI_API_KEY.", 503);
    }

    // Contexto de estilo: últimos artículos publicados.
    const { data: recentArticles } = await supabase
      .from("articles")
      .select("title, content")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(2);

    let styleExamples = "";
    for (const [index, article] of (recentArticles ?? []).entries()) {
      const plain = (article.content ?? "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 2500);
      if (plain) {
        styleExamples += `\n--- EJEMPLO ${index + 1}: ${article.title} ---\n${plain}\n`;
      }
    }

    const systemPrompt = `Eres el asistente de redacción exclusivo de Laura Niebla, fundadora de "ConIntención".
Tu objetivo es imitar su voz literaria: reflexiva, elegante, empática e introspectiva. Habla en primera persona, usa párrafos cortos y un tono de liderazgo consciente.
${
  styleExamples
    ? `\nAquí tienes ejemplos de cómo escribe Laura:\n${styleExamples}\n`
    : ""
}
${
  mode === "draft"
    ? `Escribe un borrador de aproximadamente ${requestedWords} palabras, con título y párrafos.`
    : "Propón entre 5 y 8 ideas concretas, cada una con un título breve y una línea de desarrollo."
}`;

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      { signal: AbortSignal.timeout(45_000) }
    );

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return jsonError("La IA no devolvió contenido.", 502);

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("Error en /api/ia:", error);
    return jsonError("Error procesando la solicitud de IA.", 500);
  }
}
