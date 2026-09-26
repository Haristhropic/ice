"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, PencilSimple, Trash, SpinnerGap, ArrowClockwise } from "@phosphor-icons/react";
import {
  TOOL_OPTIONS,
  createTemplate,
  deleteTemplate,
  listProfiles,
  listTemplates,
  updateTemplate,
} from "@/lib/supabase/queries";
import type { CustomTemplate, Profile, TemplateDraft, ToolType } from "@/lib/admin-types";
import { Modal } from "./Modal";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  Banner,
  EmptyState,
  Field,
  PanelHead,
  SelectInput,
  SkeletonRows,
  StatStrip,
  TextArea,
  TextInput,
  formatDate,
} from "./primitives";

interface TemplateForm {
  title: string;
  tool_type: ToolType;
  user_id: string;
  content_data: string;
}

const EMPTY_FORM: TemplateForm = {
  title: "",
  tool_type: "wheel",
  user_id: "",
  content_data: "",
};

function ownerLabel(profile: Profile): string {
  return profile.full_name ? `${profile.full_name} (${profile.email})` : profile.email;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function TemplatesPanel({
  onCountChange,
}: {
  onCountChange: (count: number) => void;
}) {
  const [items, setItems] = useState<CustomTemplate[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CustomTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<CustomTemplate | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [templatesResult, profilesResult] = await Promise.all([listTemplates(), listProfiles()]);

    if (templatesResult.ok) {
      setItems(templatesResult.data);
      setLoadError(null);
    } else {
      setLoadError(templatesResult.error);
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
    setForm({ ...EMPTY_FORM, user_id: profiles[0]?.id ?? "" });
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    setCreating(true);
  }

  function openEdit(template: CustomTemplate) {
    setForm({
      title: template.title,
      tool_type: template.tool_type,
      user_id: template.user_id,
      content_data: JSON.stringify(template.content_data, null, 2),
    });
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    setEditing(template);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setFormError(null);
    setFieldErrors({});
  }

  function validate(): { draft: TemplateDraft | null; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (form.title.trim() === "") errors.title = "Judul wajib diisi.";
    if (!editing && form.user_id === "") errors.user_id = "Pilih pemilik template.";

    let contentData: Record<string, unknown> = {};
    if (form.content_data.trim() !== "") {
      let parsed: unknown;
      try {
        parsed = JSON.parse(form.content_data);
      } catch {
        errors.content_data = "JSON tidak valid. Cek tanda kurung dan koma.";
        return { draft: null, errors };
      }
      if (!isPlainObject(parsed)) {
        errors.content_data = "Isi harus berupa objek JSON, bukan array atau teks.";
        return { draft: null, errors };
      }
      contentData = parsed;
    }

    if (Object.keys(errors).length > 0) return { draft: null, errors };

    return {
      draft: {
        title: form.title.trim(),
        tool_type: form.tool_type,
        user_id: editing ? editing.user_id : form.user_id,
        content_data: contentData,
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
      ? await updateTemplate(editing.id, {
          title: draft.title,
          tool_type: draft.tool_type,
          content_data: draft.content_data,
        })
      : await createTemplate(draft);
    setSaving(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    closeForm();
    setNotice(editing ? "Template berhasil diperbarui." : "Template baru berhasil ditambahkan.");
    await refresh();
  }

  async function onConfirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);

    const result = await deleteTemplate(deleting.id);
    setDeleteBusy(false);

    if (!result.ok) {
      setDeleteError(result.error);
      return;
    }

    setDeleting(null);
    setNotice("Template dihapus.");
    await refresh();
  }

  const distinctOwners = new Set(items.map((item) => item.user_id)).size;
  const ownerOptions = profiles.map((profile) => ({
    value: profile.id,
    label: ownerLabel(profile),
  }));

  return (
    <>
      <PanelHead
        title="Template tersimpan"
        sub="Roda, kuis, dan bank pertanyaan yang disimpan pengguna. Isi tiap template disimpan sebagai objek JSON."
        actions={
          <>
            <button
              type="button"
              className="btn btn-sm-outline"
              onClick={reload}
              aria-label="Muat ulang template"
            >
              <ArrowClockwise size={16} weight="bold" />
              Muat ulang
            </button>
            <button type="button" className="btn btn-sm-accent" onClick={openCreate}>
              <Plus size={16} weight="bold" />
              Tambah template
            </button>
          </>
        }
      />

      <StatStrip
        stats={[
          { label: "Total template", value: items.length },
          { label: "Roda putar", value: items.filter((i) => i.tool_type === "wheel").length },
          { label: "Kuis", value: items.filter((i) => i.tool_type === "quiz").length },
          { label: "Pemilik", value: distinctOwners },
        ]}
      />

      {loadError ? <Banner tone="error">{loadError}</Banner> : null}
      {notice ? <Banner tone="ok">{notice}</Banner> : null}

      {loading ? (
        <SkeletonRows rows={5} columns={5} />
      ) : loadError ? (
        <EmptyState
          title="Gagal memuat template"
          body={loadError}
          action={
            <button type="button" className="btn btn-sm-outline" onClick={reload}>
              Coba lagi
            </button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada template"
          body="Template yang disimpan pengguna akan muncul di sini. Untuk mencoba alurnya, tambahkan satu secara manual."
          action={
            <button type="button" className="btn btn-sm-accent" onClick={openCreate}>
              Tambah template
            </button>
          }
        />
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Judul</th>
                <th scope="col">Tipe</th>
                <th scope="col">Pemilik</th>
                <th scope="col">UID</th>
                <th scope="col">Diperbarui</th>
                <th scope="col">
                  <span className="visually-hidden">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-strong">{item.title}</td>
                  <td className="cell-muted">
                    {TOOL_OPTIONS.find((option) => option.value === item.tool_type)?.label ??
                      item.tool_type}
                  </td>
                  <td className="cell-muted">{item.profiles?.email ?? "Akun terhapus"}</td>
                  <td className="cell-muted cell-mono">{item.user_id.slice(0, 8)}...</td>
                  <td className="cell-muted">{formatDate(item.updated_at)}</td>
                  <td>
                    <div className="cell-actions">
                      <button
                        type="button"
                        className="btn btn-sm-outline"
                        onClick={() => openEdit(item)}
                        aria-label={`Ubah ${item.title}`}
                        title="Ubah"
                      >
                        <PencilSimple size={16} weight="bold" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm-danger"
                        onClick={() => {
                          setDeleteError(null);
                          setDeleting(item);
                        }}
                        aria-label={`Hapus ${item.title}`}
                        title="Hapus"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Ubah template" : "Template baru"}
        sub="Disimpan ke tabel custom_templates."
        footer={
          <>
            <button type="button" className="btn btn-sm-outline" onClick={closeForm}>
              Batal
            </button>
            <button
              type="submit"
              form="template-form"
              className="btn btn-sm-accent"
              disabled={saving}
            >
              {saving ? <SpinnerGap size={16} weight="bold" /> : null}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <form id="template-form" onSubmit={onSubmit} noValidate>
          {formError ? <Banner tone="error">{formError}</Banner> : null}

          <div className="form-grid">
            <Field label="Judul" htmlFor="template-title" error={fieldErrors.title}>
              <TextInput
                id="template-title"
                value={form.title}
                invalid={Boolean(fieldErrors.title)}
                onChange={(event) => setForm((p) => ({ ...p, title: event.target.value }))}
              />
            </Field>

            <Field label="Tipe alat" htmlFor="template-tool">
              <SelectInput
                id="template-tool"
                options={TOOL_OPTIONS}
                value={form.tool_type}
                onChange={(event) =>
                  setForm((p) => ({ ...p, tool_type: event.target.value as ToolType }))
                }
              />
            </Field>

            {editing ? null : (
              <Field label="Pemilik" htmlFor="template-owner" error={fieldErrors.user_id} full>
                <SelectInput
                  id="template-owner"
                  options={ownerOptions}
                  value={form.user_id}
                  invalid={Boolean(fieldErrors.user_id)}
                  onChange={(event) => setForm((p) => ({ ...p, user_id: event.target.value }))}
                />
                {ownerOptions.length === 0 ? (
                  <p className="field-help">
                    Belum ada pengguna. Buat akun dulu di tab Pengguna.
                  </p>
                ) : null}
              </Field>
            )}

            <Field
              label="Isi template (JSON)"
              htmlFor="template-content"
              help='Objet JSON. Contoh: {"options": ["A", "B"]}'
              error={fieldErrors.content_data}
              full
            >
              <TextArea
                id="template-content"
                value={form.content_data}
                invalid={Boolean(fieldErrors.content_data)}
                onChange={(event) =>
                  setForm((p) => ({ ...p, content_data: event.target.value }))
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
        title="Hapus template ini?"
        body={
          deleting
            ? `Template "${deleting.title}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`
            : ""
        }
        confirmLabel="Hapus"
        busy={deleteBusy}
        error={deleteError}
      />
    </>
  );
}
