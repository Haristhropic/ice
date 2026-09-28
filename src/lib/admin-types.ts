/* Row shapes for the four PRD tables (PRD section 5), plus the draft types
   the admin forms submit.
 *
   These stay hand-written rather than generated because the UI wants narrow
   literal unions (Role, IdeaCategory, ...) where Postgres can only promise
   `text`. The compile-time assertions at the bottom of this file check the
   column names against supabase/database.types.ts, so a migration that adds,
   renames or drops a column fails `tsc` instead of failing silently at
   runtime. Regenerate database.types.ts after any migration. */

import type { Tables } from "./supabase/database.types";

export type Role = "free" | "premium" | "admin";
export type IdeaCategory = "kelas" | "rapat" | "workshop" | "pesta";
export type Media = "online" | "offline";
export type Duration = "quick" | "medium" | "long";
export type AgeGroup = "anak" | "remaja" | "dewasa" | "lintas";
export type ToolType = "wheel" | "quiz" | "question_generator" | "timer" | "riddle";
export type ActiveGameType = "click_race" | "quiz" | "wheel";
export type RoomStatus = "waiting" | "playing" | "ended";

/* ---------- profiles ---------- */

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

/* ---------- icebreaker_ideas ---------- */

export interface IcebreakerIdea {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: IdeaCategory;
  media: Media;
  duration: Duration;
  duration_minutes: string;
  age_group: AgeGroup;
  min_players: number;
  max_players: number;
  bahan: string;
  photo_seed: string;
  steps: string[];
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/* What the create/edit form holds. No id, no timestamps. */
export type IdeaDraft = Omit<
  IcebreakerIdea,
  "id" | "created_at" | "updated_at" | "created_by"
>;

/* ---------- custom_templates ---------- */

export interface CustomTemplate {
  id: string;
  user_id: string;
  tool_type: ToolType;
  title: string;
  content_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  /* Populated by the embedded select on profiles. Absent on writes. */
  profiles?: Pick<Profile, "email" | "full_name"> | null;
}

export type TemplateDraft = Pick<
  CustomTemplate,
  "user_id" | "tool_type" | "title" | "content_data"
>;

/* ---------- game_rooms ---------- */

export interface GameRoom {
  id: string;
  room_code: string;
  host_id: string | null;
  active_game_type: ActiveGameType | null;
  status: RoomStatus;
  created_at: string;
  ended_at: string | null;
  profiles?: Pick<Profile, "email" | "full_name"> | null;
}

export type RoomDraft = Pick<
  GameRoom,
  "room_code" | "host_id" | "active_game_type" | "status"
>;


/* ---------- schema drift guard ----------
 *
 * Postgres types a `text` column with a CHECK constraint as plain `string`,
 * so the hand-written unions above cannot be verified against the generated
 * types. Column *names* can be, and that is the failure mode worth catching:
 * a renamed or dropped column would otherwise only show up as undefined at
 * runtime. `profiles` is excluded on the two tables that carry it because it
 * is added by the embedded select in queries.ts, not by the table itself. */

type GeneratedProfile = Tables<"profiles">;
type GeneratedIdea = Tables<"icebreaker_ideas">;
type GeneratedTemplate = Tables<"custom_templates">;
type GeneratedRoom = Tables<"game_rooms">;

type ExactKeys<HandWritten, Generated> = [Exclude<keyof HandWritten, keyof Generated>] extends [never]
  ? [Exclude<keyof Generated, keyof HandWritten>] extends [never]
    ? true
    : { generatedHasExtra: Exclude<keyof Generated, keyof HandWritten> }
  : { handWrittenHasExtra: Exclude<keyof HandWritten, keyof Generated> };

type Expect<T extends true> = T;

export type _ProfileColumns = Expect<ExactKeys<Profile, GeneratedProfile>>;
export type _IdeaColumns = Expect<ExactKeys<IcebreakerIdea, GeneratedIdea>>;
export type _TemplateColumns = Expect<ExactKeys<Omit<CustomTemplate, "profiles">, GeneratedTemplate>>;
export type _RoomColumns = Expect<ExactKeys<Omit<GameRoom, "profiles">, GeneratedRoom>>;

/* steps is jsonb in the database, so the generated type is the wider `Json`.
   Narrowing it to string[] here is only sound because string[] is itself a
   valid Json. The panel defends the rest at runtime via stepsOf(). */
export type _StepsIsValidJson = Expect<string[] extends GeneratedIdea["steps"] ? true : false>;

/* content_data is jsonb with a CHECK (jsonb_typeof = 'object'), which the
   type system cannot express, so Record<string, unknown> is not provably a
   Json and is deliberately left unasserted. The constraint is the guarantee. */

