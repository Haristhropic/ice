import type { Metadata } from "next";
import RoomLookup from "@/components/RoomLookup";

export const metadata: Metadata = {
  title: "Gabung room - IceBreaker Hub",
  description:
    "Masukkan kode room untuk ikut sesi ice breaking yang dimainkan host.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RoomLookup />;
}
