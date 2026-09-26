import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
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