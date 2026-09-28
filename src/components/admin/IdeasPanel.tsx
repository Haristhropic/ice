"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, PencilSimple, Trash, SpinnerGap, ArrowClockwise } from "@phosphor-icons/react";
import {
  AGE_OPTIONS,
  CATEGORY_OPTIONS,
  DURATION_OPTIONS,
  MEDIA_OPTIONS,
  createIdea,
  deleteIdea,
  listIdeas,
  updateIdea,
} from "@/lib/supabase/queries";
import type {
  AgeGroup,
  Duration,
  IdeaCategory,
  IdeaDraft,
  IcebreakerIdea,
  Media,
} from "@/lib/admin-types";
import { Modal } from "./Modal";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  Banner,
  Checkbox,
  EmptyState,
  Field,
  PanelHead,
  Pill,
  SelectInput,
  SkeletonRows,
  StatStrip,
  TextArea,
  TextInput,
  formatDate,
} from "./primitives";

interface IdeaForm {
  slug: string;
  title: string;
  category: IdeaCategory;
  media: Media;
  duration: Duration;
  duration_minutes: string;
  age_group: AgeGroup;
  min_players: string;
  max_players: string;
  description: string;
  bahan: string;
  photo_seed: string;
  steps: string;
  is_published: boolean;
}

const EMPTY_FORM: IdeaForm = {
  slug: "",
  title: "",
  category: "kelas",
  media: "offline",
  duration: "quick",
  duration_minutes: "1-3",
  age_group: "lintas",
  min_players: "2",
  max_players: "10",
  description: "",
  bahan: "",
  photo_seed: "",
  steps: "",
  is_published: true,
};

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/* steps is NOT NULL, but one malformed row should not white-screen the
   whole back-office. Do not inline this. */
const stepsOf = (idea: IcebreakerIdea): string[] =>
  Array.isArray(idea.steps) ? idea.steps : [];

function toForm(idea: IcebreakerIdea): IdeaForm {
  return {
    slug: idea.slug,
    title: idea.title,
    category: idea.category,
    media: idea.media,
    duration: idea.duration,
    duration_minutes: idea.duration_minutes,
    age_group: idea.age_group,
    min_players: String(idea.min_players),
    max_players: String(idea.max_players),
    description: idea.description,
    bahan: idea.bahan,
    photo_seed: idea.photo_seed,
    steps: stepsOf(idea).join("\n"),
    is_published: idea.is_published,
  };
}

function labelFor(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function IdeasPanel({
  userId,
  onCountChange,
}: {
  userId: string;
  onCountChange: (count: number) => void;
}) {
  const [items, setItems] = useState<IcebreakerIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState<IdeaForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<IcebreakerIdea | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<IcebreakerIdea | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await listIdeas();
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

  const formOpen = creating || editing !== null;

  function set<K extends keyof IdeaForm>(key: K, value: IdeaForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    setCreating(true);
  }

  function openEdit(idea: IcebreakerIdea) {
    setForm(toForm(idea));
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    setEditing(idea);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setFormError(null);
    setFieldErrors({});
  }

  function validate(): { draft: IdeaDraft | null; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    const steps = form.steps
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (form.title.trim() === "") errors.title = "Judul wajib diisi.";
    if (form.slug.trim() === "") {
      errors.slug = "Slug wajib diisi.";
    } else if (!SLUG_PATTERN.test(form.slug.trim())) {
      errors.slug = "Slug hanya boleh huruf kecil, angka, dan tanda hubung.";
    }
    if (form.duration_minutes.trim() === "") {
      errors.duration_minutes = "Label durasi wajib diisi.";
    }

    const min = Number.parseInt(form.min_players, 10);
    const max = Number.parseInt(form.max_players, 10);

    if (!Number.isFinite(min) || min < 1) {
      errors.min_players = "Jumlah pemain minimal harus angka 1 atau lebih.";
    }
    if (!Number.isFinite(max) || max < 1) {
      errors.max_players = "Jumlah pemain maksimal harus angka 1 atau lebih.";
    } else if (Number.isFinite(min) && max < min) {
      errors.max_players = "Jumlah maksimal harus lebih besar atau sama dengan minimal.";
    }
    if (steps.length === 0) {
      errors.steps = "Minimal satu langkah Instructions.";
    }

    if (Object.keys(errors).length > 0) {
      return { draft: null, errors };
    }

    return {
      draft: {
        slug: form.slug.trim(),
        title: form.title.trim(),
        category: form.category,
        media: form.media,
        duration: form.duration,
        duration_minutes: form.duration_minutes.trim(),
        age_group: form.age_group,
        min_players: min,
        max_players: max,
        description: form.description.trim(),
        bahan: form.bahan.trim(),
        photo_seed: form.photo_seed.trim(),
        steps,
        is_published: form.is_published,
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
      ? await updateIdea(editing.id, draft)
      : await createIdea(draft, userId);
    setSaving(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    closeForm();
    setNotice(editing ? "Ide berhasil diperbarui." : "Ide baru berhasil ditambahkan.");
    await refresh();
  }

  async function onConfirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);

    const result = await deleteIdea(deleting.id);
    setDeleteBusy(false);

    if (!result.ok) {
      setDeleteError(result.error);
      return;
    }

    setDeleting(null);
    setNotice("Ide dihapus dari katalog.");
    await refresh();
  }

  const totalSteps = items.reduce((sum, idea) => sum + stepsOf(idea).length, 0);
  const published = items.filter((idea) => idea.is_published).length;

  return (
    <>
      <PanelHead
        title="Katalog game"
        sub="Baris di sini adalah sumber katalog publik. Menyetel Tayang membuat ide langsung muncul di halaman depan."
        actions={
          <>
            <button
              type="button"
              className="btn btn-sm-outline"
              onClick={reload}
              aria-label="Muat ulang katalog"
            >
              <ArrowClockwise size={16} weight="bold" />
              Muat ulang
            </button>
            <button type="button" className="btn btn-sm-accent" onClick={openCreate}>
              <Plus size={16} weight="bold" />
              Tambah ide
            </button>
          </>
        }
      />

      <StatStrip
        stats={[
          { label: "Total ide", value: items.length },
          { label: "Tayang", value: published },
          { label: "Draft", value: items.length - published },
          { label: "Total langkah", value: totalSteps },
        ]}
      />

      {loadError ? <Banner tone="error">{loadError}</Banner> : null}
      {notice ? <Banner tone="ok">{notice}</Banner> : null}

      {loading ? (
        <SkeletonRows rows={5} columns={7} />
      ) : loadError ? (
        <EmptyState
          title="Gagal memuat katalog"
          body={loadError}
          action={
            <button type="button" className="btn btn-sm-outline" onClick={reload}>
              Coba lagi
            </button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Katalog masih kosong"
          body="Belum ada ide game. Tambahkan yang pertama, atau jalankan supabase/seed.sql untuk mengisi 6 contoh dari katalog lama."
          action={
            <button type="button" className="btn btn-sm-accent" onClick={openCreate}>
              Tambah ide
            </button>
          }
        />
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Judul</th>
                <th scope="col">Kategori</th>
                <th scope="col">Media</th>
                <th scope="col">Durasi</th>
                <th scope="col">Pemain</th>
                <th scope="col">Status</th>
                <th scope="col">Diperbarui</th>
                <th scope="col">
                  <span className="visually-hidden">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((idea) => (
                <tr key={idea.id}>
                  <td>
                    <div className="cell-strong">{idea.title}</div>
                    <div className="cell-muted cell-mono">{idea.slug}</div>
                  </td>
                  <td className="cell-muted">{labelFor(CATEGORY_OPTIONS, idea.category)}</td>
                  <td className="cell-muted">
                    {idea.media === "online" ? "Online" : "Offline"}
                  </td>
                  <td className="cell-muted">{labelFor(DURATION_OPTIONS, idea.duration)}</td>
                  <td className="cell-num">
                    {idea.min_players}-{idea.max_players}
                  </td>
                  <td>
                    <Pill tone={idea.is_published ? "teal" : "neutral"}>
                      {idea.is_published ? "Tayang" : "Draft"}
                    </Pill>
                  </td>
                  <td className="cell-muted">{formatDate(idea.updated_at)}</td>
                  <td>
                    <div className="cell-actions">
                      <button
                        type="button"
                        className="btn btn-sm-outline"
                        onClick={() => openEdit(idea)}
                        aria-label={`Ubah ${idea.title}`}
                        title="Ubah"
                      >
                        <PencilSimple size={16} weight="bold" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm-danger"
                        onClick={() => {
                          setDeleteError(null);
                          setDeleting(idea);
                        }}
                        aria-label={`Hapus ${idea.title}`}
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
        title={editing ? "Ubah ide" : "Ide baru"}
        sub="Semua isian tersimpan ke tabel icebreaker_ideas."
        footer={
          <>
            <button type="button" className="btn btn-sm-outline" onClick={closeForm}>
              Batal
            </button>
            <button
              type="submit"
              form="idea-form"
              className="btn btn-sm-accent"
              disabled={saving}
            >
              {saving ? <SpinnerGap size={16} weight="bold" /> : null}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <form id="idea-form" onSubmit={onSubmit} noValidate>
          {formError ? <Banner tone="error">{formError}</Banner> : null}

          <div className="form-grid">
            <Field label="Judul" htmlFor="idea-title" error={fieldErrors.title}>
              <TextInput
                id="idea-title"
                value={form.title}
                invalid={Boolean(fieldErrors.title)}
                onChange={(event) => set("title", event.target.value)}
              />
            </Field>

            <Field
              label="Slug"
              htmlFor="idea-slug"
              help="Huruf kecil, angka, dan tanda hubung. Contoh: two-truths-lie"
              error={fieldErrors.slug}
            >
              <TextInput
                id="idea-slug"
                value={form.slug}
                invalid={Boolean(fieldErrors.slug)}
                onChange={(event) => set("slug", event.target.value)}
              />
            </Field>

            <Field label="Kategori acara" htmlFor="idea-category">
              <SelectInput
                id="idea-category"
                options={CATEGORY_OPTIONS}
                value={form.category}
                onChange={(event) => set("category", event.target.value as IdeaCategory)}
              />
            </Field>

            <Field label="Media" htmlFor="idea-media">
              <SelectInput
                id="idea-media"
                options={MEDIA_OPTIONS}
                value={form.media}
                onChange={(event) => set("media", event.target.value as Media)}
              />
            </Field>

            <Field label="Durasi" htmlFor="idea-duration">
              <SelectInput
                id="idea-duration"
                options={DURATION_OPTIONS}
                value={form.duration}
                onChange={(event) => set("duration", event.target.value as Duration)}
              />
            </Field>

            <Field
              label="Label durasi"
              htmlFor="idea-duration-minutes"
              help="Label yang tampil di katalog publik. Contoh: 1-3"
              error={fieldErrors.duration_minutes}
            >
              <TextInput
                id="idea-duration-minutes"
                value={form.duration_minutes}
                invalid={Boolean(fieldErrors.duration_minutes)}
                onChange={(event) => set("duration_minutes", event.target.value)}
              />
            </Field>

            <Field label="Kelompok usia" htmlFor="idea-age">
              <SelectInput
                id="idea-age"
                options={AGE_OPTIONS}
                value={form.age_group}
                onChange={(event) => set("age_group", event.target.value as AgeGroup)}
              />
            </Field>

            <Field label="Pemain minimal" htmlFor="idea-min" error={fieldErrors.min_players}>
              <TextInput
                id="idea-min"
                type="number"
                min={1}
                value={form.min_players}
                invalid={Boolean(fieldErrors.min_players)}
                onChange={(event) => set("min_players", event.target.value)}
              />
            </Field>

            <Field label="Pemain maksimal" htmlFor="idea-max" error={fieldErrors.max_players}>
              <TextInput
                id="idea-max"
                type="number"
                min={1}
                value={form.max_players}
                invalid={Boolean(fieldErrors.max_players)}
                onChange={(event) => set("max_players", event.target.value)}
              />
            </Field>

            <Field label="Deskripsi" htmlFor="idea-description" full>
              <TextArea
                id="idea-description"
                value={form.description}
                onChange={(event) => set("description", event.target.value)}
              />
            </Field>

            <Field
              label="Bahan"
              htmlFor="idea-bahan"
              help="Bahan atau properti yang dibutuhkan"
              full
            >
              <TextInput
                id="idea-bahan"
                value={form.bahan}
                onChange={(event) => set("bahan", event.target.value)}
              />
            </Field>

            <Field
              label="Seed foto"
              htmlFor="idea-photo-seed"
              help="Seed picsum untuk foto katalog. Contoh: simon-says-party"
              full
            >
              <TextInput
                id="idea-photo-seed"
                value={form.photo_seed}
                onChange={(event) => set("photo_seed", event.target.value)}
              />
            </Field>

            <Field
              label="Langkah instructions"
              htmlFor="idea-steps"
              help="Satu langkah per baris. Baris kosong diabaikan."
              error={fieldErrors.steps}
              full
            >
              <TextArea
                id="idea-steps"
                value={form.steps}
                invalid={Boolean(fieldErrors.steps)}
                onChange={(event) => set("steps", event.target.value)}
              />
            </Field>

            <div className="field-full">
              <Checkbox
                id="idea-published"
                checked={form.is_published}
                onChange={(checked) => set("is_published", checked)}
                label="Tayang di katalog publik"
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => void onConfirmDelete()}
        title="Hapus ide ini?"
        body={
          deleting
            ? `Ide "${deleting.title}" akan dihapus permanen dari katalog. Tindakan ini tidak bisa dibatalkan.`
            : ""
        }
        confirmLabel="Hapus"
        busy={deleteBusy}
        error={deleteError}
      />
    </>
  );
}
