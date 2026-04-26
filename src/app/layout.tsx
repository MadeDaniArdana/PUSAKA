import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PUSAKA — Smart Village Hub",
  description:
    "Platform pelaporan lingkungan terintegrasi dan Smart Village untuk tata kelola desa yang transparan dan efisien.",
  keywords: ["smart village", "pusaka", "pelaporan lingkungan", "UMKM desa", "administrasi desa"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
