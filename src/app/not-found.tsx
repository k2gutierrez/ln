import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFD] px-6 text-center">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
        404
      </p>
      <h1 className="mb-4 text-balance font-serif text-4xl font-bold text-slate-900 md:text-5xl">
        Esta página no existe
      </h1>
      <p className="mb-8 max-w-md text-slate-600">
        Puede que el enlace esté roto o que el artículo ya no esté disponible.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-slate-900 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          Volver al inicio
        </Link>
        <Link
          href="/articulos"
          className="rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Ver artículos
        </Link>
      </div>
    </div>
  );
}
