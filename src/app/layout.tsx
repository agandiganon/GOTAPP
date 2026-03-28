import type { Metadata, Viewport } from "next";
import { Cinzel, Frank_Ruhl_Libre, Heebo } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { ChunkLoadGuard } from "@/components/runtime/chunk-load-guard";
import { Providers } from "@/app/providers";

import "leaflet/dist/leaflet.css";
import "@/app/globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700"],
});

/* Cinzel — Roman-numeral / ornamental titling, Latin-only */
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "gotspoil",
  description: "מלווה צפייה נטול ספוילרים לפרקים של משחקי הכס.",
  applicationName: "gotspoil",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#080910",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className={`${heebo.variable} ${frankRuhlLibre.variable} ${cinzel.variable} bg-canvas text-ink antialiased`}>
        <Providers>
          <ChunkLoadGuard />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
