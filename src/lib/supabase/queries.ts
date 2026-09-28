import { getSupabase, describeError } from "./client";
import type {
  ActiveGameType,
  AgeGroup,
  CustomTemplate,
  Duration,
  GameRoom,
  IdeaCategory,
  IdeaDraft,
  IcebreakerIdea,
  Media,
  Profile,
  Role,
  RoomStatus,
  RoomDraft,
  TemplateDraft,
  ToolType,
} from "@/lib/admin-types";

/* Every call returns a Result instead of throwing. Admin screens show an
   inline error next to the form that failed, so a rejected promise would
   force a try/catch at every call site and is easy to forget. */

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const ok = <T,>(data: T): Result<T> => ({ ok: true, data });
const fail = (error: unknown): Result<never> => ({
  ok: false,
  error: describeError(error),
});

/* supabase-js has no generated Database type here, so its `.data` is
   `any`. These two helpers are the single place that happens; every
   caller gets a real type. */
const rows = <T,>(data: unknown): T[] => (Array.isArray(data) ? (data as T[]) : []);
const row = <T,>(data: unknown): T => data as T;


/* ==================== auth ==================== */

export async function signIn(email: string, password: string): Promise<Result<true>> {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  return error ? fail(error) : ok(true);
}

export async function signUp(
  email: string,
  password: string,
): Promise<Result<{ needsEmailConfirmation: boolean }>> {
  const { data, error } = await getSupabase().auth.signUp({ email, password });
  if (error) return fail(error);
  return ok({ needsEmailConfirmation: data.user?.email != null && data.session == null });
}

export async function signOut(): Promise<Result<true>> {
  const { error } = await getSupabase().auth.signOut();
  return error ? fail(error) : ok(true);
}

export async function getCurrentProfile(): Promise<Result<Profile | null>> {
  const { data: sessionData, error: sessionError } = await getSupabase().auth.getSession();
  if (sessionError) return fail(sessionError);

  const userId = sessionData.session?.user.id;
  if (!userId) return ok(null);

  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) return fail(error);
  return ok(data ? row<Profile>(data) : null);
}


/* ==================== icebreaker_ideas ==================== */

/* Columns the public catalog actually renders. created_by and is_published are
   deliberately omitted so an admin's uuid never reaches the public payload. */
const PUBLIC_IDEA_COLUMNS =
  "slug,title,description,category,media,duration,duration_minutes,age_group," +
  "min_players,max_players,bahan,steps";

/* The public catalog's read path. No session is required and none is created:
   the `ideas_select` policy grants anon SELECT on published rows, so an
   anonymous visitor gets exactly the published set. The explicit
   is_published filter keeps the intent legible at the call site and means an
   admin's own session cannot widen what the public page renders. */
export async function listPublishedIdeas(): Promise<Result<IcebreakerIdea[]>> {
  const { data, error } = await getSupabase()
    .from("icebreaker_ideas")
    .select(PUBLIC_IDEA_COLUMNS)
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) return fail(error);
  return ok(rows<IcebreakerIdea>(data));
}

export async function listIdeas(): Promise<Result<IcebreakerIdea[]>> {
  const { data, error } = await getSupabase()
    .from("icebreaker_ideas")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return fail(error);
  return ok(rows<IcebreakerIdea>(data));
}

export async function createIdea(
  draft: IdeaDraft,
  userId: string,
): Promise<Result<IcebreakerIdea>> {
  const { data, error } = await getSupabase()
    .from("icebreaker_ideas")
    .insert({ ...draft, created_by: userId })
    .select()
    .single();

  if (error) return fail(error);
  return ok(row<IcebreakerIdea>(data));
}

export async function updateIdea(
  id: string,
  patch: Partial<IdeaDraft>,
): Promise<Result<IcebreakerIdea>> {
  const { data, error } = await getSupabase()
    .from("icebreaker_ideas")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return fail(error);
  return ok(row<IcebreakerIdea>(data));
}

export async function deleteIdea(id: string): Promise<Result<true>> {
  const { error } = await getSupabase().from("icebreaker_ideas").delete().eq("id", id);
  return error ? fail(error) : ok(true);
}


/* ==================== custom_templates ==================== */

const TEMPLATE_SELECT = "*, profiles(email, full_name)";

export async function listTemplates(): Promise<Result<CustomTemplate[]>> {
  const { data, error } = await getSupabase()
    .from("custom_templates")
    .select(TEMPLATE_SELECT)
    .order("updated_at", { ascending: false });

  if (error) return fail(error);
  return ok(rows<CustomTemplate>(data));
}

export async function createTemplate(
  draft: TemplateDraft,
): Promise<Result<CustomTemplate>> {
  const { data, error } = await getSupabase()
    .from("custom_templates")
    .insert(draft)
    .select(TEMPLATE_SELECT)
    .single();

  if (error) return fail(error);
  return ok(row<CustomTemplate>(data));
}

export async function updateTemplate(
  id: string,
  patch: Partial<Omit<TemplateDraft, "user_id">>,
): Promise<Result<CustomTemplate>> {
  const { data, error } = await getSupabase()
    .from("custom_templates")
    .update(patch)
    .eq("id", id)
    .select(TEMPLATE_SELECT)
    .single();

  if (error) return fail(error);
  return ok(row<CustomTemplate>(data));
}

export async function deleteTemplate(id: string): Promise<Result<true>> {
  const { error } = await getSupabase().from("custom_templates").delete().eq("id", id);
  return error ? fail(error) : ok(true);
}


/* ==================== game_rooms ==================== */

const ROOM_SELECT = "*, profiles(email, full_name)";

export async function listRooms(): Promise<Result<GameRoom[]>> {
  const { data, error } = await getSupabase()
    .from("game_rooms")
    .select(ROOM_SELECT)
    .order("created_at", { ascending: false });

  if (error) return fail(error);
  return ok(rows<GameRoom>(data));
}

export async function createRoom(draft: RoomDraft): Promise<Result<GameRoom>> {
  const { data, error } = await getSupabase()
    .from("game_rooms")
    .insert(draft)
    .select(ROOM_SELECT)
    .single();

  if (error) return fail(error);
  return ok(row<GameRoom>(data));
}

export async function updateRoom(
  id: string,
  patch: Partial<Omit<RoomDraft, "room_code">>,
): Promise<Result<GameRoom>> {
  const { data, error } = await getSupabase()
    .from("game_rooms")
    .update(patch)
    .eq("id", id)
    .select(ROOM_SELECT)
    .single();

  if (error) return fail(error);
  return ok(row<GameRoom>(data));
}

export async function deleteRoom(id: string): Promise<Result<true>> {
  const { error } = await getSupabase().from("game_rooms").delete().eq("id", id);
  return error ? fail(error) : ok(true);
}


/* ==================== public room lookup ==================== */

/* The public projection of a game_rooms row. Deliberately narrower than
   GameRoom: host_id is the host's auth.users uuid, and anon is not granted
   SELECT on that column, so asking for it here would just 42501. */
export interface PublicRoom {
  room_code: string;
  status: RoomStatus;
  active_game_type: ActiveGameType | null;
  created_at: string;
}

export const ROOM_CODE_PATTERN = /^[A-Z0-9]{4,8}$/;

/* Resolves a room code for a participant who has no account. Returns null for
   both "no such code" and "that room already ended" on purpose: the RLS hides
   ended rooms from anon, so the two are genuinely indistinguishable, and
   saying otherwise would leak which codes are real. */
export async function findActiveRoomByCode(raw: string): Promise<Result<PublicRoom | null>> {
  const code = raw.trim().toUpperCase();
  if (!ROOM_CODE_PATTERN.test(code)) {
    return fail(new Error("Kode room harus 4-8 karakter huruf kapital atau angka."));
  }

  const { data, error } = await getSupabase()
    .from("game_rooms")
    .select("room_code, status, active_game_type, created_at")
    .eq("room_code", code)
    .maybeSingle();

  if (error) return fail(error);
  return ok(data ? row<PublicRoom>(data) : null);
}


/* ==================== profiles ==================== */

export async function listProfiles(): Promise<Result<Profile[]>> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return fail(error);
  return ok(rows<Profile>(data));
}

export async function updateProfileRole(id: string, role: Role): Promise<Result<Profile>> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (error) return fail(error);
  return ok(row<Profile>(data));
}


/* ==================== shared option lists ====================
   Kept next to the queries so the form selects and the schema CHECK
   constraints cannot drift apart silently. */

export const CATEGORY_OPTIONS: ReadonlyArray<{ value: IdeaCategory; label: string }> = [
  { value: "kelas", label: "Kelas" },
  { value: "rapat", label: "Rapat kantor" },
  { value: "workshop", label: "Workshop" },
  { value: "pesta", label: "Pesta / casual" },
];

export const MEDIA_OPTIONS: ReadonlyArray<{ value: Media; label: string }> = [
  { value: "offline", label: "Offline (tanpa gadget)" },
  { value: "online", label: "Online (Zoom / Teams)" },
];

export const DURATION_OPTIONS: ReadonlyArray<{ value: Duration; label: string }> = [
  { value: "quick", label: "Quick (1-3 menit)" },
  { value: "medium", label: "Medium (5-10 menit)" },
  { value: "long", label: "Long (lebih dari 15 menit)" },
];

export const AGE_OPTIONS: ReadonlyArray<{ value: AgeGroup; label: string }> = [
  { value: "anak", label: "Anak-anak" },
  { value: "remaja", label: "Remaja" },
  { value: "dewasa", label: "Dewasa / profesional" },
  { value: "lintas", label: "Lintas usia" },
];

export const TOOL_OPTIONS: ReadonlyArray<{ value: ToolType; label: string }> = [
  { value: "wheel", label: "Roda putar" },
  { value: "quiz", label: "Kuis" },
  { value: "question_generator", label: "Generator pertanyaan" },
  { value: "timer", label: "Timer" },
  { value: "riddle", label: "Tebak frasa" },
];

export const ROOM_STATUS_OPTIONS: ReadonlyArray<{ value: RoomStatus; label: string }> = [
  { value: "waiting", label: "Menunggu" },
  { value: "playing", label: "Sedang berjalan" },
  { value: "ended", label: "Selesai" },
];

export const ROOM_GAME_OPTIONS: ReadonlyArray<{
  value: ActiveGameType;
  label: string;
}> = [
  { value: "click_race", label: "Cepat-kepat klik" },
  { value: "quiz", label: "Kuis" },
  { value: "wheel", label: "Roda" },
];

export const ROLE_OPTIONS: ReadonlyArray<{ value: Role; label: string }> = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
  { value: "admin", label: "Admin" },
];
