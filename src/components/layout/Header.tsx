'use client'; // <-- Agregamos esto para permitir interactividad en el navegador

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  // Estado para controlar si el menú móvil está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);

  // Función para cerrar el menú automáticamente al hacer clic en un enlace
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FDFDFD]/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo / Nombre de la columna (Tus estilos originales intactos) */}
        <Link href="/" onClick={closeMenu} className="text-2xl font-semibold tracking-tight text-slate-900">
          Con<span className="font-light text-slate-500">Intención</span><span className="font-semibold tracking-tight text-slate-900 text-xs"> By Laura Niebla</span>
        </Link>
        
        {/* Navegación Desktop */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">Inicio</Link>
          <Link href="/articulos" className="hover:text-slate-900 transition-colors">Artículos</Link>
          <Link href="/eventos" className="hover:text-slate-900 transition-colors">Eventos</Link>
          <Link href="/acerca-de-laura" className="hover:text-slate-900 transition-colors">Sobre Laura</Link>
        </nav>

        {/* Botón Menú Mobile interactivo */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Abrir menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            {isOpen ? (
              // Ícono de "X" cuando el menú está abierto
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              // Ícono de "Hamburguesa" cuando el menú está cerrado (el que ya tenías)
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* --- Menú Desplegable para Celulares --- */}
      {/* Usamos una transición suave de altura y opacidad */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#FDFDFD] ${
          isOpen ? 'max-h-64 border-b border-slate-100 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col px-6 py-4 gap-4 text-sm font-medium text-slate-600 shadow-inner">
          <Link href="/" onClick={closeMenu} className="block hover:text-slate-900 transition-colors py-2">Inicio</Link>
          <Link href="/articulos" onClick={closeMenu} className="block hover:text-slate-900 transition-colors py-2">Artículos</Link>
          <Link href="/eventos" onClick={closeMenu} className="block hover:text-slate-900 transition-colors py-2">Eventos</Link>
          <Link href="/acerca-de-laura" onClick={closeMenu} className="block hover:text-slate-900 transition-colors py-2">Sobre Laura</Link>
        </nav>
      </div>
    </header>
  );
}