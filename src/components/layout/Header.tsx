"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/articulos", label: "Artículos" },
  { href: "/eventos", label: "Eventos" },
  { href: "/acerca-de-laura", label: "Sobre Laura" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-[#FDFDFD]/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="text-2xl font-semibold tracking-tight text-slate-900"
        >
          Con<span className="font-light text-slate-500">Intención</span>
          <span className="ml-1 hidden text-xs font-semibold tracking-tight text-slate-900 min-[380px]:inline">
            By Laura Niebla
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <nav className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="p-2 text-slate-600 transition-colors hover:text-slate-900 md:hidden"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`overflow-hidden border-slate-100 bg-[#FDFDFD] transition-all duration-300 ease-in-out md:hidden ${
          isOpen
            ? "max-h-64 border-b opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-4 px-6 py-4 text-sm font-medium text-slate-600 shadow-inner">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="block py-2 transition-colors hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
