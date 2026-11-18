import sanitizeHtml from "sanitize-html";

/** Quita todo el HTML y deja texto plano. Para comentarios y nombres. */
export function sanitizePlainText(input: string): string {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

/** Quita enlaces de un texto plano (los comentarios no permiten URLs). */
export function stripLinks(text: string): string {
  return text.replace(/https?:\/\/\S+/gi, "[enlace eliminado]");
}

/**
 * Saneamiento del HTML de los artículos (escrito por la administradora
 * con Quill). Elimina scripts, iframes, eventos inline y URLs peligrosas,
 * pero conserva el formato del editor.
 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "blockquote",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "a",
      "span",
      "hr",
      "pre",
      "code",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      p: ["class"],
      span: ["class"],
      h2: ["class"],
      h3: ["class"],
      li: ["class"],
      blockquote: ["class"],
    },
    allowedClasses: {
      p: [
        "ql-align-center",
        "ql-align-right",
        "ql-align-justify",
        "ql-indent-1",
        "ql-indent-2",
        "ql-indent-3",
      ],
      span: ["ql-formula"],
      h2: ["ql-align-center", "ql-align-right", "ql-align-justify"],
      h3: ["ql-align-center", "ql-align-right", "ql-align-justify"],
      li: ["ql-indent-1", "ql-indent-2", "ql-indent-3"],
      blockquote: ["ql-align-center", "ql-align-right", "ql-align-justify"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  });
}

/** Solo permite URLs http(s) para enlaces externos. */
export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * Comprueba que la petición venga del mismo sitio (defensa CSRF básica).
 * Si no hay cabecera Origin (curl, bots), se deja pasar y se apoya en
 * el rate limit y la validación de payload.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Limita el tamaño del cuerpo JSON leído. */
export async function readJsonBody<T = unknown>(
  request: Request,
  maxBytes = 16_000
): Promise<T | null> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes) return null;

  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
