import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  isSameOrigin,
  isUuid,
  readJsonBody,
  sanitizePlainText,
  stripLinks,
} from "@/lib/security";

export const runtime = "nodejs";

const MAX_CONTENT_LENGTH = 2000;
const MAX_NAME_LENGTH = 60;

interface RequestBody {
  article_id?: unknown;
  user_name?: unknown;
  content?: unknown;
  website?: unknown;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return jsonError("Origen no permitido.", 403);
    }

    // Límite por IP: 5 comentarios cada 10 minutos.
    const ip = getClientIp(request);
    const limit = rateLimit(`comments:${ip}`, 5, 10 * 60 * 1000);

    if (!limit.ok) {
      return NextResponse.json(
        { error: "Has enviado muchos comentarios. Espera unos minutos." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await readJsonBody<RequestBody>(request, 8_000);
    if (!body) return jsonError("Solicitud inválida.", 400);

    // Honeypot: los bots rellenan este campo. Respondemos como si todo
    // hubiera ido bien para no darles pistas.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    if (!isUuid(body.article_id)) {
      return jsonError("Artículo inválido.", 400);
    }

    if (typeof body.content !== "string") {
      return jsonError("El comentario es obligatorio.", 400);
    }

    const content = stripLinks(sanitizePlainText(body.content));

    if (content.length < 3) {
      return jsonError("El comentario es demasiado corto.", 400);
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return jsonError("El comentario es demasiado largo.", 400);
    }

    const rawName =
      typeof body.user_name === "string" ? body.user_name : "";
    const userName =
      sanitizePlainText(rawName).slice(0, MAX_NAME_LENGTH) || "Anónimo";

    const supabase = createSupabaseAdminClient();

    // Solo se permiten comentarios en artículos publicados.
    const { data: article } = await supabase
      .from("articles")
      .select("id")
      .eq("id", body.article_id)
      .eq("is_published", true)
      .maybeSingle();

    if (!article) {
      return jsonError("Artículo no disponible.", 404);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonError("La moderación no está disponible.", 503);
    }

    // Moderación: si falla, no publicamos (fail-closed).
    let moderationText = "";
    try {
      const openai = new OpenAI({ apiKey });
      const moderation = await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un moderador de comentarios. Responde únicamente con la palabra SAFE o UNSAFE. Un comentario es UNSAFE si contiene odio, insultos, acoso, contenido ofensivo, negatividad extrema, spam o enlaces.",
            },
            { role: "user", content },
          ],
          temperature: 0,
          max_tokens: 4,
        },
        { signal: AbortSignal.timeout(12_000) }
      );

      moderationText = moderation.choices[0]?.message?.content ?? "";
    } catch (error) {
      console.error("Error en moderación:", error);
      return jsonError(
        "No pudimos verificar el comentario. Inténtalo de nuevo en unos minutos.",
        503
      );
    }

    const verdict = moderationText.trim().toUpperCase();
    if (!verdict.startsWith("SAFE")) {
      return jsonError(
        "El contenido no cumple con las normas de la comunidad.",
        400
      );
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        article_id: body.article_id,
        user_name: userName,
        content,
      })
      .select("id, article_id, user_name, content, created_at, is_admin_reply")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, comment: data });
  } catch (error) {
    console.error("Error en la API de comentarios:", error);
    return jsonError("No se pudo procesar el comentario.", 500);
  }
}
