import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link
            href="/admin/dashboard"
            className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900"
          >
            Panel
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              Ver sitio ↗
            </Link>
            <ThemeToggle className="h-9 w-9" />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
