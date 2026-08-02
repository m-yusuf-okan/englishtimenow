import type { Catalog } from "@/domain";
import { softwareEnglish } from "./workspaces/software-english/index.ts";

/**
 * Katalog kaydı — tüm içeriğin tek giriş noktası.
 *
 * Yeni bir workspace eklemek iki satırdır: yukarıya import, aşağıya dizi
 * elemanı. Uygulama kodunun hiçbir yerinde ikinci bir içerik listesi olmamalı;
 * sorgular `@/lib/catalog` üzerinden yapılır.
 *
 * Dizideki sıra kullanıcıya gösterilen sıradır.
 */
export const catalog: Catalog = [softwareEnglish];
