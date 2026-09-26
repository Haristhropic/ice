import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted instead of next/font/google: the build-time Google Fonts fetch
// times out behind proxies, so ./fonts is committed rather than downloaded.
const baloo = localFont({
  src: "./fonts/Baloo2-Variable.woff2",
  weight: "400 800",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const nunito = localFont({
  src: "./fonts/Nunito-Variable.woff2",
  weight: "200 1000",
  style: "normal",
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "IceBreaker Hub - Cairkan suasana, mulai dari satu klik",
  description:
    "Koleksi ice breaker digital dan offline untuk kelas, rapat, workshop, dan kumpul keluarga. Buka di laptop, langsung main.",
  metadataBase: new URL("https://icebreakerhub.example.com"),
  openGraph: {
    title: "IceBreaker Hub - Cairkan suasana, mulai dari satu klik",
    description:
      "Koleksi ice breaker digital dan offline untuk kelas, rapat, workshop, dan kumpul keluarga.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${baloo.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}