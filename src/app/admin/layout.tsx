import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - IceBreaker Hub",
  description: "Kelola katalog, template, room, dan pengguna IceBreaker Hub.",
  robots: { index: false, follow: false },
};

/* Passthrough on purpose: the shell is in AdminApp, because the signed-out
   view is a full-height .login-wrap and must not nest inside .admin-shell. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
