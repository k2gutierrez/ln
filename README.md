# ConIntención — Laura Niebla (`ln`)

Blog personal de Laura Niebla construido con **Next.js 15** (App Router),
**Supabase** (base de datos, autenticación y storage) y **OpenAI** (asistente
de redacción y moderación de comentarios).

Incluye modo claro/oscuro, panel de administración protegido, SEO y
notificaciones con Sonner.

- **Producción:** <https://lauraniebla.com>
- **Repositorio:** <https://github.com/k2gutierrez/ln>

> **Next.js 15** se eligió a propósito: AWS Amplify Hosting soporta Next.js
> hasta la versión 15. Next.js 16 no está soportado todavía.

## Puesta en marcha

### 1. Requisitos

- Node.js 20 o superior
- Un proyecto de Supabase
- Una API key de OpenAI

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

| Variable | Dónde obtenerla | ¿Obligatoria? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | Sí (comentarios) |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | Sí (IA y comentarios) |
| `OPENAI_MODEL` | Opcional. Por defecto `gpt-4o-mini` | No |
| `NEXT_PUBLIC_SITE_URL` | URL pública con `https://` (producción: `https://lauraniebla.com`) | Sí en producción |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 (`G-XXXXXXXXXX`) | No |

> `SUPABASE_SERVICE_ROLE_KEY` es secreta y solo se usa en el servidor. Nunca
> la prefijas con `NEXT_PUBLIC_` ni la subas al repositorio.

### 3. Base de datos

Ejecuta [`supabase/schema.sql`](supabase/schema.sql) en el SQL Editor de
Supabase. Crea las tablas (`articles`, `profiles`, `daily_quotes`, `events`,
`comments`), las políticas RLS y el bucket público `media`.

### 4. Usuario administrador

En Supabase → Authentication → Users, crea el usuario de Laura con email y
contraseña. El esquema crea automáticamente su fila en `profiles`.

### 5. Arrancar

```bash
npm install
npm run dev
```

- Sitio público: http://localhost:3000
- Panel: http://localhost:3000/admin/login

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |

## Arquitectura

```
src/
  app/
    (public)/          Sitio público (inicio, artículos, eventos, autora)
    (admin)/admin/     Panel privado (dashboard, artículos, eventos, frase, perfil, IA)
    api/ia/            Asistente de redacción (solo administradora)
    api/comments/      Comentarios públicos (moderados y con rate limit)
    sitemap.ts         Sitemap dinámico
    robots.ts          Robots.txt
  components/          Header, footer, carrusel, comentarios, UI
  lib/
    supabase/          Clientes browser / server / admin
    security.ts        Saneamiento de HTML, validaciones, CSRF
    rate-limit.ts      Límite de peticiones en memoria
    site.ts, format.ts Utilidades
  middleware.ts        Refresco de sesión y guard de /admin
```

## Seguridad

- **Panel protegido**: el middleware valida el JWT con Supabase y redirige a
  `/admin/login` si no hay sesión. Las páginas de admin son `noindex`.
- **RLS activo** en todas las tablas: lectura pública de contenido publicado,
  escritura solo para usuarios autenticados. Los comentarios anónimos se
  insertan con la service role desde el servidor.
- **`/api/ia`** exige sesión válida y tiene rate limit por usuario e IP.
- **`/api/comments`** es público (los lectores comentan), pero:
  - rate limit por IP (5 cada 10 minutos),
  - honeypot anti-bots,
  - validación de tipo y tamaño del payload,
  - verificación de que el artículo exista y esté publicado,
  - moderación con OpenAI antes de guardar (si falla, no publica),
  - saneamiento de HTML y eliminación de enlaces,
  - comprobación de `Origin` (CSRF).
- **XSS**: el HTML de los artículos se sanea con `sanitize-html` antes de
  renderizarse; el JSON-LD escapa `<`. Comentarios y nombres se guardan como
  texto plano.
- **SQL injection**: todas las consultas usan el cliente de Supabase
  (consultas parametrizadas). No hay SQL construido con entrada del usuario.
- **Cabeceras**: CSP, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` y HSTS, definidas en
  `next.config.ts`.

> El rate limit es en memoria: protege una sola instancia. Si el sitio crece a
> varias instancias, conviene moverlo a Upstash/Redis.

## SEO

- Metadatos por artículo (`generateMetadata`): título, descripción, canonical,
  Open Graph y Twitter.
- JSON-LD `BlogPosting` en cada artículo.
- `sitemap.xml` dinámico y `robots.txt`.
- 404 personalizado.

`NEXT_PUBLIC_SITE_URL` debe ser el dominio real en producción para que las
URLs canónicas y Open Graph sean absolutas. Debe incluir el protocolo:

```bash
NEXT_PUBLIC_SITE_URL=https://lauraniebla.com
```

Sin `https://` el build falla (`Invalid URL`), porque el valor se usa en
`metadataBase` y en `new URL()`.

## Recuperación de contraseña

El flujo ya está implementado:

- `/admin/recuperar` — la persona escribe su correo y recibe el enlace.
- `/auth/confirm` — verifica el token del correo y crea la sesión.
- `/admin/restablecer` — define la nueva contraseña (mínimo 8 caracteres).

Para que funcione en producción, configura Supabase:

### 1. URL Configuration

Authentication → **URL Configuration**:

| Campo | Valor |
| --- | --- |
| Site URL | `https://www.lauraniebla.com` (el host que sirve el sitio) |
| Redirect URLs | `https://www.lauraniebla.com/**` |
| | `https://lauraniebla.com/**` |
| | `http://localhost:3000/**` |

> Hoy el apex `lauraniebla.com` redirige a `www`, así que el Site URL debe
> usar el host servido para evitar un salto extra en el enlace del correo.

### 2. Plantilla del correo

Authentication → **Email Templates** → **Reset Password**. Sustituye el
enlace por:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/admin/restablecer">
  Restablecer contraseña
</a>
```

Es importante usar `{{ .TokenHash }}` (no `{{ .ConfirmationURL }}`): así el
token se verifica en el servidor y la sesión queda en cookies.

### 3. Prueba

Authentication → **Users** → menú del usuario → **Reset password**, o entra a
`/admin/recuperar` y escribe el correo. El enlace caduca y es de un solo uso.

## Despliegue en AWS Amplify

1. Conecta el repositorio y deja que Amplify detecte Next.js (SSR).
2. En **App settings → Environment variables** define todas las variables de
   `.env.local`, incluida:

   ```bash
   NEXT_PUBLIC_SITE_URL=https://lauraniebla.com
   ```
3. Las variables `NEXT_PUBLIC_*` se incrustan en el build: si cambian, hay que
   volver a desplegar.
4. Confirma que la rama use Node 20+.

### Dominio de producción

El dominio es **<https://lauraniebla.com>** y su zona DNS está en AWS Route 53.

1. En Amplify → **Domain management**, agrega `lauraniebla.com`.
2. Crea el registro **ALIAS A** que indique Amplify (Route 53 permite
   seleccionar el recurso de Amplify directamente).
3. Agrega `www.lauraniebla.com` como **redirección 301** al dominio principal.
4. Verifica `https://lauraniebla.com/sitemap.xml` y el `<link rel="canonical">`
   de un artículo.

> El dominio ya tiene los NS en Route 53, pero necesita el registro A/ALIAS.
> Mientras no exista, `lauraniebla.com` no resuelve.

Notas:

- El proyecto ya está en **Next.js 15**, la última versión soportada por
  Amplify.
- Amplify no soporta streaming ni Edge Middleware; este proyecto no depende de
  ninguna de las dos cosas.
- El plan gratuito de Supabase pausa proyectos por inactividad. Si el blog
  recibe poco tráfico, programa un ping periódico o usa un plan de pago.
- Rota la `OPENAI_API_KEY` antes de publicar y usa una key con límite de gasto.

## Tema oscuro

El sitio usa `next-themes` con estrategia de clase. El toggle está en el header
público y en la barra superior del panel. La preferencia se guarda en
`localStorage` y por defecto sigue al sistema.
