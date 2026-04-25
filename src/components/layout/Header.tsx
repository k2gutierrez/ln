import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#FDFDFD]/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo / Nombre de la columna */}
        <Link href="/" className="text-2xl font-semibold tracking-tight text-slate-900">
          Con<span className="font-light text-slate-500">Intención</span><span className="font-semibold tracking-tight text-slate-900 text-xs"> By Laura Niebla</span>
        </Link>
        
        {/* Navegación Desktop */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">Inicio</Link>
          <Link href="/articulos" className="hover:text-slate-900 transition-colors">Artículos</Link>
          <Link href="/eventos" className="hover:text-slate-900 transition-colors">Eventos</Link>
          <Link href="/acerca-de-laura" className="hover:text-slate-900 transition-colors">Sobre Laura</Link>
        </nav>

        {/* Botón Menú Mobile (La lógica de abrir/cerrar la agregaremos después) */}
        <button className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </header>
  );
}