"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowClockwise, SpinnerGap, ShieldCheck } from "@phosphor-icons/react";
import { ROLE_OPTIONS, listProfiles, updateProfileRole } from "@/lib/supabase/queries";
import type { Profile, Role } from "@/lib/admin-types";
import { Modal } from "./Modal";
import {
  Banner,
  EmptyState,
  PanelHead,
  Pill,
  PillTone,
  SelectInput,
  SkeletonRows,
  StatStrip,
  formatDate,
} from "./primitives";

const ROLE_TONE: ReadonlyArray<{ value: Role; tone: PillTone }> = [
  { value: "admin", tone: "accent" },
  { value: "premium", tone: "sun" },
  { value: "free", tone: "neutral" },
];

const ROLE_LABEL: ReadonlyArray<{ value: Role; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "premium", label: "Premium" },
  { value: "free", label: "Free" },
];

function roleLabel(role: Role): string {
  return ROLE_LABEL.find((entry) => entry.value === role)?.label ?? role;
}

function roleTone(role: Role): PillTone {
  return ROLE_TONE.find((entry) => entry.value === role)?.tone ?? "neutral";
}

export function UsersPanel({
  currentUserId,
  onCountChange,
}: {
  currentUserId: string;
  onCountChange: (count: number) => void;
}) {
  const [items, setItems] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [pending, setPending] = useState<{ id: string; email: string; role: Role } | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const result = await listProfiles();

    if (result.ok) {
      setItems(result.data);
      setLoadError(null);
    } else {
      setLoadError(result.error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // Mount-time read: every setState in refresh sits after an await,
    // so the rule's "synchronous cascade" cannot occur here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  function reload() {
    setLoading(true);
    setLoadError(null);
    setNotice(null);
    void refresh();
  }

  useEffect(() => {
    onCountChange(items.length);
  }, [items.length, onCountChange]);

  function stageChange(profile: Profile, role: Role) {
    if (role === profile.role) return;
    setActionError(null);
    setNotice(null);
    setPending({ id: profile.id, email: profile.email, role });
  }

  function cancelChange() {
    setPending(null);
    setActionError(null);
  }

  async function confirmChange() {
    if (!pending) return;
    setSaving(true);
    setActionError(null);

    const result = await updateProfileRole(pending.id, pending.role);
    setSaving(false);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setNotice(
      `${pending.email} sekarang berperan ${roleLabel(pending.role).toLowerCase()}.`,
    );
    setPending(null);
    await refresh();
  }

  const countBy = (role: Role) => items.filter((profile) => profile.role === role).length;

  return (
    <>
      <PanelHead
        title="Pengguna"
        sub="Akun ini dibuat sendiri oleh orang yang mendaftar lewat halaman admin. Hanya peran admin yang boleh menulis ke database, jadi ubahlah dengan hati-hati. Peran milikmu sendiri tidak bisa diubah di sini."
        actions={
          <button
            type="button"
            className="btn btn-sm-outline"
            onClick={reload}
            aria-label="Muat ulang daftar pengguna"
          >
            <ArrowClockwise size={16} weight="bold" />
            Muat ulang
          </button>
        }
      />

      <StatStrip
        stats={[
          { label: "Total pengguna", value: items.length },
          { label: "Admin", value: countBy("admin") },
          { label: "Premium", value: countBy("premium") },
          { label: "Free", value: countBy("free") },
        ]}
      />

      {loadError ? <Banner tone="error">{loadError}</Banner> : null}
      {actionError ? <Banner tone="error">{actionError}</Banner> : null}
      {notice ? <Banner tone="ok">{notice}</Banner> : null}

      {loading ? (
        <SkeletonRows rows={5} columns={4} />
      ) : loadError ? (
        <EmptyState
          title="Gagal memuat pengguna"
          body={loadError}
          action={
            <button type="button" className="btn btn-sm-outline" onClick={reload}>
              Coba lagi
            </button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada pengguna"
          body="Akun akan muncul di sini setelah seseorang mendaftar lewat halaman admin. Pergi ke /admin, pilih Daftar, lalu buat akun pertama."
        />
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Nama</th>
                <th scope="col">Peran</th>
                <th scope="col">Bergabung</th>
                <th scope="col">UID</th>
              </tr>
            </thead>
            <tbody>
              {items.map((profile) => {
                const isSelf = profile.id === currentUserId;
                return (
                  <tr key={profile.id}>
                    <td className="cell-strong">{profile.email}</td>
                    <td className="cell-muted">{profile.full_name ?? "-"}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <Pill tone={roleTone(profile.role)}>{roleLabel(profile.role)}</Pill>
                        {isSelf ? (
                          <span className="cell-muted">kamu</span>
                        ) : (
                          <div style={{ maxWidth: 150 }}>
                            <SelectInput
                              aria-label={`Ubah peran ${profile.email}`}
                              title={`Ubah peran ${profile.email}`}
                              options={ROLE_OPTIONS}
                              value={profile.role}
                              onChange={(event) =>
                                stageChange(profile, event.target.value as Role)
                              }
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="cell-muted">{formatDate(profile.created_at)}</td>
                    <td className="cell-muted cell-mono">{profile.id.slice(0, 8)}...</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={pending !== null}
        onClose={cancelChange}
        title="Ganti peran pengguna"
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="btn btn-sm-outline"
              onClick={cancelChange}
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-sm-accent"
              onClick={() => void confirmChange()}
              disabled={saving}
            >
              {saving ? <SpinnerGap size={16} weight="bold" /> : <ShieldCheck size={16} weight="bold" />}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        {actionError ? <Banner tone="error">{actionError}</Banner> : null}

        {pending ? (
          <>
            <p className="admin-panel-sub">
              Peran <strong>{pending.email}</strong> akan diubah menjadi{" "}
              <strong>{roleLabel(pending.role)}</strong>.
            </p>
            {pending.role === "admin" ? (
              <p className="field-help" style={{ marginTop: 10 }}>
                Begitu peran ini aktif, orang tersebut bisa membuat, mengubah, dan menghapus
                semua isi katalog, template, dan room.
              </p>
            ) : null}
          </>
        ) : null}
      </Modal>
    </>
  );
}
