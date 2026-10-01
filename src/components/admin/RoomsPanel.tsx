"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, PencilSimple, Trash, SpinnerGap, ArrowClockwise } from "@phosphor-icons/react";
import {
  ROOM_GAME_OPTIONS,
  ROOM_STATUS_OPTIONS,
  createRoom,
  deleteRoom,
  listProfiles,
  listRooms,
  updateRoom,
} from "@/lib/supabase/queries";
import type {
  ActiveGameType,
  GameRoom,
  Profile,
  RoomDraft,
  RoomStatus,
} from "@/lib/admin-types";
import { Modal } from "./Modal";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  Banner,
  EmptyState,
  Field,
  PanelHead,
  Pill,
  PillTone,
  SelectInput,
  SkeletonRows,
  StatStrip,
  TextInput,
  formatDate,
} from "./primitives";

interface RoomForm {
  room_code: string;
  host_id: string;
  status: RoomStatus;
  active_game_type: ActiveGameType | "";
}

const EMPTY_FORM: RoomForm = {
  room_code: "",
  host_id: "",
  status: "waiting",
  active_game_type: "",
};

const CODE_PATTERN = /^[A-Z0-9]{4,8}$/;

const GAME_OPTIONS: ReadonlyArray<{ value: ActiveGameType | ""; label: string }> = [
  { value: "", label: "Belum dipilih" },
  ...ROOM_GAME_OPTIONS,
];

const STATUS_LABEL: ReadonlyArray<{ value: RoomStatus; label: string; tone: PillTone }> = [
  { value: "waiting", label: "Menunggu", tone: "neutral" },
  { value: "playing", label: "Sedang berjalan", tone: "sun" },
  { value: "ended", label: "Selesai", tone: "teal" },
];

function ownerLabel(profile: Profile): string {
  return profile.full_name ? `${profile.full_name} (${profile.email})` : profile.email;
}

export function RoomsPanel({
  onCountChange,
}: {
  onCountChange: (count: number) => void;
}) {
  const [items, setItems] = useState<GameRoom[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState<RoomForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GameRoom | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<GameRoom | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [roomsResult, profilesResult] = await Promise.all([listRooms(), listProfiles()]);

    if (roomsResult.ok) {
      setItems(roomsResult.data);
      setLoadError(null);
    } else {
      setLoadError(roomsResult.error);
    }

    if (profilesResult.ok) {
      setProfiles(profilesResult.data);
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

  const formOpen = creating || editing !== null;

  function openCreate() {
    setForm({ ...EMPTY_FORM, host_id: profiles[0]?.id ?? "" });
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    setCreating(true);
  }

  function openEdit(room: GameRoom) {
    setForm({
      room_code: room.room_code,
      host_id: room.host_id ?? "",
      status: room.status,
      active_game_type: room.active_game_type ?? "",
    });
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    setEditing(room);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setFormError(null);
    setFieldErrors({});
  }

  function validate(): { draft: RoomDraft | null; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!editing) {
      const code = form.room_code.trim();
      if (code === "") {
        errors.room_code = "Kode room wajib diisi.";
      } else if (!CODE_PATTERN.test(code)) {
        errors.room_code = "Kode room harus 4-8 karakter huruf kapital atau angka.";
      } else if (items.some((room) => room.room_code === code)) {
        errors.room_code = "Kode room sudah dipakai. Pilih kode lain.";
      }
    }

    if (form.host_id === "") errors.host_id = "Pilih host room.";

    if (Object.keys(errors).length > 0) return { draft: null, errors };

    return {
      draft: {
        room_code: form.room_code.trim(),
        host_id: form.host_id,
        status: form.status,
        active_game_type: form.active_game_type === "" ? null : form.active_game_type,
      },
      errors,
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const { draft, errors } = validate();
    setFieldErrors(errors);

    if (!draft) {
      setFormError("Periksa lagi isian yang ditandai merah.");
      return;
    }

    setSaving(true);
    const result = editing
      ? await updateRoom(editing.id, {
          host_id: draft.host_id,
          status: draft.status,
          active_game_type: draft.active_game_type,
        })
      : await createRoom(draft);
    setSaving(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    closeForm();
    setNotice(editing ? "Room berhasil diperbarui." : "Room baru berhasil dibuat.");
    await refresh();
  }

  async function onConfirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);

    const result = await deleteRoom(deleting.id);
    setDeleteBusy(false);

    if (!result.ok) {
      setDeleteError(result.error);
      return;
    }

    setDeleting(null);
    setNotice("Room dihapus.");
    await refresh();
  }

  const ownerOptions = profiles.map((profile) => ({
    value: profile.id,
    label: ownerLabel(profile),
  }));
  const countBy = (status: RoomStatus) =>
    items.filter((room) => room.status === status).length;

  return (
    <>
      <PanelHead
        title="Room permainan"
        sub="Room dipakai saat peserta bergabung lewat HP dengan kode pendek. Fitur ini masih tahap dua roadmap."
        actions={
          <>
            <button
              type="button"
              className="pkey pkey-quiet pkey-sm"
              onClick={reload}
              aria-label="Muat ulang room"
            >
              <ArrowClockwise size={16} weight="bold" />
              Muat ulang
            </button>
            <button type="button" className="pkey pkey-stamp pkey-sm" onClick={openCreate}>
              <Plus size={16} weight="bold" />
              Buat room
            </button>
          </>
        }
      />

      <StatStrip
        stats={[
          { label: "Total room", value: items.length },
          { label: "Menunggu", value: countBy("waiting") },
          { label: "Sedang berjalan", value: countBy("playing") },
          { label: "Selesai", value: countBy("ended") },
        ]}
      />

      {loadError ? <Banner tone="error">{loadError}</Banner> : null}
      {notice ? <Banner tone="ok">{notice}</Banner> : null}

      {loading ? (
        <SkeletonRows rows={5} columns={6} />
      ) : loadError ? (
        <EmptyState
          title="Gagal memuat room"
          body={loadError}
          action={
            <button type="button" className="pkey pkey-quiet pkey-sm" onClick={reload}>
              Coba lagi
            </button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada room"
          body="Room dibuat saat seorang host membuka sesi game untuk peserta. Buat satu manual untuk mencoba alurnya."
          action={
            <button type="button" className="pkey pkey-stamp pkey-sm" onClick={openCreate}>
              Buat room
            </button>
          }
        />
      ) : (
        <div className="table-scroll">
          <table className="ltable">
            <thead>
              <tr>
                <th scope="col">Kode</th>
                <th scope="col">Host</th>
                <th scope="col">Game</th>
                <th scope="col">Status</th>
                <th scope="col">Dibuat</th>
                <th scope="col">
                  <span className="visually-hidden">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((room) => {
                const status = STATUS_LABEL.find((entry) => entry.value === room.status);
                const game = ROOM_GAME_OPTIONS.find(
                  (option) => option.value === room.active_game_type,
                );
                return (
                  <tr key={room.id}>
                    <td className="code">{room.room_code}</td>
                    <td className="muted">{room.profiles?.email ?? "Tanpa host"}</td>
                    <td className="muted">{game?.label ?? "Belum dipilih"}</td>
                    <td>
                      <Pill tone={status?.tone ?? "neutral"}>
                        {status?.label ?? room.status}
                      </Pill>
                    </td>
                    <td className="muted">{formatDate(room.created_at)}</td>
                    <td>
                      <div className="cell-actions">
                        <button
                          type="button"
                          className="pkey pkey-quiet pkey-sm"
                          onClick={() => openEdit(room)}
                          aria-label={`Ubah room ${room.room_code}`}
                          title="Ubah"
                        >
                          <PencilSimple size={16} weight="bold" />
                        </button>
                        <button
                          type="button"
                          className="pkey pkey-danger pkey-sm"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleting(room);
                          }}
                          aria-label={`Hapus room ${room.room_code}`}
                          title="Hapus"
                        >
                          <Trash size={16} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Ubah room" : "Room baru"}
        sub="Kode room tidak bisa diubah setelah dibuat, karena peserta sudah menghafalnya."
        footer={
          <>
            <button type="button" className="pkey pkey-quiet pkey-sm" onClick={closeForm}>
              Batal
            </button>
            <button
              type="submit"
              form="room-form"
              className="pkey pkey-stamp pkey-sm"
              disabled={saving}
            >
              {saving ? <SpinnerGap size={16} weight="bold" /> : null}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <form id="room-form" onSubmit={onSubmit} noValidate>
          {formError ? <Banner tone="error">{formError}</Banner> : null}

          <div className="form-grid">
            {editing ? (
              <Field label="Kode room" htmlFor="room-code" full>
                <TextInput id="room-code" value={form.room_code} readOnly />
                <p className="field-help">Kode room bersifat permanen.</p>
              </Field>
            ) : (
              <Field
                label="Kode room"
                htmlFor="room-code"
                help="4-8 karakter huruf kapital dan angka. Contoh: A7K2"
                error={fieldErrors.room_code}
                full
              >
                <TextInput
                  id="room-code"
                  value={form.room_code}
                  invalid={Boolean(fieldErrors.room_code)}
                  onChange={(event) =>
                    setForm((p) => ({ ...p, room_code: event.target.value.toUpperCase() }))
                  }
                />
              </Field>
            )}

            <Field label="Host" htmlFor="room-host" error={fieldErrors.host_id} full>
              <SelectInput
                id="room-host"
                options={ownerOptions}
                value={form.host_id}
                invalid={Boolean(fieldErrors.host_id)}
                onChange={(event) => setForm((p) => ({ ...p, host_id: event.target.value }))}
              />
              {ownerOptions.length === 0 ? (
                <p className="field-help">Belum ada pengguna. Buat akun dulu di tab Pengguna.</p>
              ) : null}
            </Field>

            <Field label="Status" htmlFor="room-status">
              <SelectInput
                id="room-status"
                options={ROOM_STATUS_OPTIONS}
                value={form.status}
                onChange={(event) =>
                  setForm((p) => ({ ...p, status: event.target.value as RoomStatus }))
                }
              />
            </Field>

            <Field label="Game aktif" htmlFor="room-game">
              <SelectInput
                id="room-game"
                options={GAME_OPTIONS}
                value={form.active_game_type}
                onChange={(event) =>
                  setForm((p) => ({ ...p, active_game_type: event.target.value as ActiveGameType | "" }))
                }
              />
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => void onConfirmDelete()}
        title="Hapus room ini?"
        body={
          deleting
            ? `Room ${deleting.room_code} akan dihapus permanen. Semua peserta yang sedang bergabung akan langsung terputus.`
            : ""
        }
        confirmLabel="Hapus"
        busy={deleteBusy}
        error={deleteError}
      />
    </>
  );
}
