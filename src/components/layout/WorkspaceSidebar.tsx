"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { themeTokens } from "@/domain";
import type { Workspace } from "@/domain";

/**
 * Workspace ve kategoriler arası navigasyon — PRD 4.
 *
 * İstemci bileşeni olmasının iki sebebi var: aktif bağlantıyı `usePathname` ile
 * işaretlemek ve mobilde açılır menüyü yönetmek. Katalog verisi sunucudan prop
 * olarak geçer — bu bileşen `@/lib/catalog`'u import etmez, böylece tüm içerik
 * istemci paketine sızmaz.
 *
 * Masaüstünde kalıcı yan sütun, mobilde katlanır menü. Aynı liste iki kez
 * render edilmez; tek liste CSS ile konumlandırılır.
 */
export function WorkspaceSidebar({ workspaces }: { workspaces: readonly Workspace[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    // Genişlik ve sütun kenarlığı sarmalayan layout'a ait; burada yalnızca
    // mobildeki alt ayraç var. İkisini de tanımlamak çakışma üretiyordu.
    <nav
      aria-label="Çalışma alanları"
      className="border-b border-black/10 md:border-b-0 dark:border-white/10"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="workspace-nav-list"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:hidden"
      >
        Kategoriler
        <span aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      <div
        id="workspace-nav-list"
        // Mobilde katlanır, masaüstünde her zaman açık. `hidden` yerine sınıf
        // değişimi kullanılıyor ki masaüstünde buton durumu davranışı etkilemesin.
        className={`${open ? "block" : "hidden"} px-2 pb-4 md:block md:py-4`}
      >
        {workspaces.map((workspace) => (
          <div key={workspace.slug} className="mb-4 last:mb-0">
            <Link
              href={`/${workspace.slug}`}
              className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-black/5 focus-visible:ring-2 focus-visible:outline-none dark:hover:bg-white/10"
              aria-current={pathname === `/${workspace.slug}` ? "page" : undefined}
            >
              {workspace.title}
            </Link>

            <ul className="mt-1 space-y-0.5 pl-3">
              {workspace.categories.map((category) => {
                const href = `/${workspace.slug}/${category.slug}`;
                const active = pathname === href;
                const tokens = themeTokens(category.theme);

                return (
                  <li key={category.slug}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-black/5 focus-visible:ring-2 focus-visible:outline-none dark:hover:bg-white/10 ${
                        active ? `font-medium ${tokens.surface}` : ""
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`size-2 shrink-0 rounded-full ${tokens.accent}`}
                      />
                      {category.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
