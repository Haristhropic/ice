import type { Metadata } from "next";
import Console from "@/components/Console";

export const metadata: Metadata = {
  title: "IceBreaker Hub - Cairkan suasana, mulai dari satu klik",
  description:
    "Koleksi ice breaker digital dan offline untuk kelas, rapat, workshop, dan kumpul keluarga. Buka di laptop, langsung main.",
};

export default function Page() {
  return <Console />;
}
