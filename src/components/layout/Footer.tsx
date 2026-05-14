export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-500">
          © {currentYear} ConIntención by Laura Niebla. Todos los derechos reservados.
        </p>
        
        {/* Enlaces a Redes (Estos serán dinámicos después) */}
        <div className="flex gap-6 text-sm font-medium text-slate-500">
          <a href="https://www.linkedin.com/in/laura-niebla" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">LinkedIn</a>
          <a href="https://www.instagram.com/laura_niebla_coach?igsh=MTk1bGVhbHVoZWYycA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">Instagram</a>
          <a href="https://www.facebook.com/lniebla" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">Facebook</a>
        </div>
      </div>
    </footer>
  );
}