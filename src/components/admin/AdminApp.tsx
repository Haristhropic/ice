"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { SquaresFour, Stack, ListChecks, Users, SignOut, SpinnerGap } from "@phosphor-icons/react";
import { describeError, getSupabase } from "@/lib/supabase/client";
import { getCurrentProfile, signOut as signOutRequest } from "@/lib/supabase/queries";
import type { Profile } from "@/lib/admin-types";
import { AdminLogin } from "./AdminLogin";
import { IdeasPanel } from "./IdeasPanel";
import { TemplatesPanel } from "./TemplatesPanel";
import { RoomsPanel } from "./RoomsPanel";
import { UsersPanel } from "./UsersPanel";
import { Banner } from "./primitives";

type TabId = "catalog" | "templates" | "rooms" | "users";

const TABS: ReadonlyArray<{ id: TabId; label: string; icon: ReactNode }> = [
  { id: "catalog", label: "Katalog", icon: <SquaresFour size={16} weight="bold" /> },
  { id: "templates", label: "Template", icon: <Stack size={16} weight="bold" /> },
  { id: "rooms", label: "Room", icon: <ListChecks size={16} weight="bold" /> },
  { id: "users", label: "Pengguna", icon: <Users size={16} weight="bold" /> },
];

export function AdminApp() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("catalog");
  const [counts, setCounts] = useState<Partial<Record<TabId, number>>>({});
  const [signingOut, setSigningOut] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const result = await getCurrentProfile();
      if (result.ok) {
        setProfile(result.data);
        setAuthError(null);
      } else {
        setProfile(null);
        setAuthError(result.error);
      }
    } catch (error) {
      setProfile(null);
      setAuthError(describeError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Mount-time read: every setState in loadProfile sits after an await,
    // so the rule's "synchronous cascade" cannot occur here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    const { data } = getSupabase().auth.onAuthStateChange(() => {
      setTimeout(() => void loadProfile(), 0);
    });

    return () => data.subscription.unsubscribe();
  }, [loadProfile]);

  const onCountChange = useCallback((id: TabId, value: number) => {
    setCounts((previous) => (previous[id] === value ? previous : { ...previous, [id]: value }));
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOutRequest();
    setProfile(null);
    setSigningOut(false);
  }

  if (loading) {
    return (
      <div className="login-wrap">
        <div className="login-card" style={{ textAlign: "center" }}>
          <SpinnerGap size={28} weight="bold" aria-hidden="true" />
          <p className="login-sub" style={{ marginTop: 12, marginBottom: 0 }}>
            Memeriksa sesi...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        {authError ? (
          <div className="login-wrap" style={{ paddingBottom: 0 }}>
            <div style={{ maxWidth: 620, width: "100%" }}>
              <Banner tone="error">{authError}</Banner>
            </div>
          </div>
        ) : null}
        <AdminLogin />
      </>
    );
  }

  if (profile.role !== "admin") {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1 className="login-title">Belum punya akses admin</h1>
          <p className="login-sub">
            Akun <strong>{profile.email}</strong> sudah masuk, tapi role-nya masih{" "}
            <code>{profile.role}</code>. Jalankan perintah promote di bagian bawah{" "}
            <code>supabase/schema.sql</code>, lalu muat ulang halaman ini.
          </p>
          <button
            type="button"
            className="btn btn-sm-outline"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <SignOut size={16} weight="bold" />
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link className="admin-brand" href="/">
            <span className="admin-brand-mark" aria-hidden="true">
              🧊
            </span>
            IceBreaker Hub
            <span style={{ color: "var(--sun)", fontWeight: 700 }}>/ Admin</span>
          </Link>
          <div className="admin-topbar-meta">
            <span className="admin-topbar-email" title={profile.email}>
              {profile.email}
            </span>
            <button
              type="button"
              className="btn btn-on-dark"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <SignOut size={14} weight="bold" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Bagian admin">
        <div className="admin-tabs-inner">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? "admin-tab is-active" : "admin-tab"}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              {item.label}
              {counts[item.id] !== undefined ? (
                <span className="admin-tab-count">{counts[item.id]}</span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>

      <main className="admin-body">
        {tab === "catalog" ? (
          <IdeasPanel userId={profile.id} onCountChange={(n) => onCountChange("catalog", n)} />
        ) : null}
        {tab === "templates" ? (
          <TemplatesPanel onCountChange={(n) => onCountChange("templates", n)} />
        ) : null}
        {tab === "rooms" ? <RoomsPanel onCountChange={(n) => onCountChange("rooms", n)} /> : null}
        {tab === "users" ? (
          <UsersPanel
            currentUserId={profile.id}
            onCountChange={(n) => onCountChange("users", n)}
          />
        ) : null}
      </main>
    </div>
  );
}
