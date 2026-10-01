"use client";

import { useState, type FormEvent } from "react";
import { SpinnerGap } from "@phosphor-icons/react";
import { signIn, signUp } from "@/lib/supabase/queries";
import { Banner, Field, TextInput } from "./primitives";

type Mode = "signin" | "signup";

export function AdminLogin() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    if (mode === "signup") {
      const result = await signUp(email, password);
      setBusy(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (result.data.needsEmailConfirmation) {
        setNotice("Akun dibuat. Cek inbox untuk link konfirmasi, lalu masuk kembali.");
      }
      setMode("signin");
      return;
    }

    const result = await signIn(email, password);
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
    }
  }

  const isSignUp = mode === "signup";

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-title">Masuk ke admin</h1>
        <p className="login-sub">
          Halaman ini hanya untuk pengelola. Buatkan akun dulu, lalu jalankan perintah promote
          admin di bagian bawah <code>supabase/schema.sql</code>.
        </p>

        {error ? <Banner tone="error">{error}</Banner> : null}
        {notice ? <Banner tone="ok">{notice}</Banner> : null}

        <form className="login-fields" onSubmit={onSubmit} noValidate>
          <Field label="Email" htmlFor="admin-email">
            <TextInput
              id="admin-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="kamu@contoh.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Field
            label="Password"
            htmlFor="admin-password"
            help={isSignUp ? "Minimal 6 karakter." : undefined}
          >
            <TextInput
              id="admin-password"
              type="password"
              name="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={isSignUp ? 6 : undefined}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>

          <button type="submit" className="pkey pkey-stamp pkey-sm" disabled={busy}>
            {busy ? <SpinnerGap size={16} weight="bold" /> : null}
            {busy ? "Memproses..." : isSignUp ? "Buat akun" : "Masuk"}
          </button>
        </form>

        <p className="login-switch">
          {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isSignUp ? "signin" : "signup");
              setError(null);
              setNotice(null);
            }}
          >
            {isSignUp ? "Masuk" : "Daftar"}
          </button>
        </p>
      </div>
    </div>
  );
}
