import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PRD: backend yok, $0 statik hosting. `next build` doğrudan `out/` üretir.
  output: "export",

  // Statik export'ta görsel optimizasyonu bir sunucu gerektirir; kapatılmazsa
  // `next/image` kullanan ilk sayfada build patlar.
  images: { unoptimized: true },

  // Ev dizininde (C:\Users\Lenovo\package-lock.json) başıboş bir lockfile var ve
  // Turbopack workspace kökünü oraya kaydırıyor. Kökü sabitlemezsek dosya
  // izleme tüm ev dizinini kapsar.
  turbopack: { root: path.resolve(import.meta.dirname) },
};

export default nextConfig;
