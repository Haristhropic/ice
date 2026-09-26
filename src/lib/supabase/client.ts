import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* Single browser client for the whole app.
 *
 * Sessions live in localStorage (supabase-js default). That is fine here
 * because authorization is enforced by Postgres RLS, not by where the
 * token sits: a stolen token still cannot write, because every write
 * policy checks public.is_admin(). Swapping to @supabase/ssr later for
 * cookie-based sessions is a drop-in change to this file only.
 *
 * Must stay a browser module. Do not import it from a Server Component. */

let cached: SupabaseClient | null = null;

/* Read as literals on purpose: Next.js inlines NEXT_PUBLIC_* only for literal
   member access. A dynamic process.env[name] compiles to an empty object in
   the browser bundle, so do not "simplify" these two lines back. */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill it in, then restart the dev server.`,
    );
  }
  return value;
}

export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  cached = createClient(
    requireEnv(url, "NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(anonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );

  return cached;
}

/* Turns a PostgREST / Auth error into something a non-engineer can act on.
   The raw objects are terse ("new row violates row-level security
   policy") and leak table internals when shown as-is. */
export function describeError(error: unknown): string {
  if (!error || typeof error !== "object") return "Terjadi kesalahan yang tidak diketahui.";

  const code = "code" in error ? String(error.code) : "";
  const raw = "message" in error ? String(error.message) : "";
  const lower = raw.toLowerCase();

  if (code === "42501" || lower.includes("row-level security")) {
    return "Akses ditolak. Akun ini belum berperan admin, atau sesi sudah kedaluwarsa.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Email atau password salah.";
  }
  if (lower.includes("user already registered")) {
    return "Email ini sudah punya akun. Silakan masuk.";
  }
  if (lower.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Cek inbox atau folder spam dulu.";
  }
  if (lower.includes("password should be at least")) {
    return "Password minimal 6 karakter.";
  }
  if (code === "PGRST205" || lower.includes("schema cache")) {
    return "Tabel belum terbaca database. Tunggu sebentar, lalu jalankan 'select 1;' di Supabase SQL Editor.";
  }
  if (lower.includes("failed to fetch") || lower.includes("networkerror")) {
    return "Tidak bisa menghubungi server. Periksa koneksi internet.";
  }
  if (raw) return raw;

  return "Terjadi kesalahan yang tidak diketahui.";
}
