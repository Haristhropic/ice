import type { Metadata } from "next";
import JoinStage from "@/components/JoinStage";

export const metadata: Metadata = {
  title: "Join Stage - IceBreaker Hub",
  description:
    "Masukkan kode room untuk masuk ke sesi ice breaking yang dimainkan host.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <JoinStage />;
}
