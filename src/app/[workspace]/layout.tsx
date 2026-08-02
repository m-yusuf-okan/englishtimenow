import Link from "next/link";
import { WorkspaceSidebar } from "@/components/layout/WorkspaceSidebar";
import { listWorkspaces } from "@/lib/catalog";

/**
 * Workspace kabuğu: sidebar + içerik alanı.
 *
 * Sidebar burada durur (kategori sayfasında değil) çünkü App Router layout'ları
 * kategori geçişlerinde yeniden render edilmez — menü durumu ve kaydırma
 * konumu korunur.
 */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="flex flex-col border-black/5 bg-white/40 backdrop-blur-xl md:w-64 md:shrink-0 md:border-r dark:border-white/10 dark:bg-white/3">
        <Link
          href="/"
          className="px-4 py-4 text-sm font-bold tracking-tight focus-visible:ring-2 focus-visible:outline-none md:px-6"
        >
          englishtimenow
        </Link>
        <WorkspaceSidebar workspaces={listWorkspaces()} />
      </div>
      {children}
    </div>
  );
}
