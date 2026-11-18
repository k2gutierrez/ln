export const siteName = "ConIntención";
export const siteAuthor = "Laura Niebla";
export const siteDescription =
  "Un espacio semanal dedicado a la reflexión empresarial, el liderazgo consciente y el crecimiento personal, escrito por Laura Niebla.";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const siteUrl = rawSiteUrl.replace(/\/+$/, "");

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteUrl).toString();
}
