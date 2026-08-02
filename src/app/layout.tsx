import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "englishtimenow — İngilizce Kelime Kartları",
  description:
    "Yazılım İngilizcesi, günlük konuşma ve akademik kelime dağarcığı için sesli telaffuzlu kelime ve test kartları.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Arayüz dili Türkçe. Kartlardaki İngilizce metinler tek tek `lang="en"`
    // ile işaretlenir; ekran okuyucu o parçalarda İngilizce sese geçer.
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
