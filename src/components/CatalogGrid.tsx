"use client";
import { useEffect, useState } from "react";
import {
  CATALOG,
  type AgeGroup,
  type Duration,
  type EventCategory,
  type IcebreakerIdea,
  type Media,
} from "@/lib/data";
import { listPublishedIdeas } from "@/lib/supabase/queries";
import { sfx, unlockAudio } from "@/lib/sound";

type Group = "cat" | "media" | "dur" | "umur";
type FilterValue = string;

const GROUPS: { group: Group; label: string; values: FilterValue[] }[] = [
  {
    group: "cat",
    label: "Acara",
    values: ["semua", "kelas", "rapat", "workshop", "pesta"],
  },
  {
    group: "media",
    label: "Media",
    values: ["semua", "online", "offline"],
  },
  {
    group: "dur",
    label: "Durasi",
    values: ["semua", "quick", "medium", "long"],
  },
  {
    group: "umur",
    label: "Usia",
    values: ["semua", "anak", "remaja", "dewasa", "lintas"],
  },
];

function matchGame(
  g: (typeof CATALOG)[number],
  f: Record<Group, FilterValue>,
): boolean {
  return (
    (f.cat === "semua" || g.category === (f.cat as EventCategory)) &&
    (f.media === "semua" || g.media === (f.media as Media)) &&
    (f.dur === "semua" || g.duration === (f.dur as Duration)) &&
    (f.umur === "semua" || g.ageGroup === (f.umur as AgeGroup))
  );
}

const DURATION_LABEL: Record<Duration, string> = {
  quick: "1-3 mnt",
  medium: "5-10 mnt",
  long: "15+ mnt",
};

const CARD_THEMES = [
  "linear-gradient(150deg, #ffd875, #ffc53d)",
  "linear-gradient(150deg, #ffe3dc, #ff8fb1)",
  "linear-gradient(150deg, #e6faf7, #1fb6a6)",
  "linear-gradient(150deg, #dfe6ff, #5b7fff)",
  "linear-gradient(150deg, #f2e8d4, #ec8a00)",
  "linear-gradient(150deg, #efe8ff, #7d5bff)",
];

function themeFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 997;
  return CARD_THEMES[hash % CARD_THEMES.length];
}

const VALID_CATEGORY: EventCategory[] = ["kelas", "rapat", "workshop", "pesta"];
const VALID_MEDIA: Media[] = ["online", "offline"];
const VALID_DURATION: Duration[] = ["quick", "medium", "long"];
const VALID_AGE: AgeGroup[] = ["anak", "remaja", "dewasa", "lintas"];

function narrow<T extends string>(value: unknown, allowed: T[]): T | null {
  return typeof value === "string" && (allowed as string[]).includes(value)
    ? (value as T)
    : null;
}

/* Postgres types these columns as plain `string`, so a row edited outside the
   admin form can carry a value the unions do not accept. Such a row is dropped
   rather than rendered, because a bad category would silently never match any
   filter and an unknown duration would print "undefined" in the card meta. */
function toIdea(input: unknown): IcebreakerIdea | null {
  if (typeof input !== "object" || input === null) return null;
  const row = input as Record<string, unknown>;

  const category = narrow(row.category, VALID_CATEGORY);
  const media = narrow(row.media, VALID_MEDIA);
  const duration = narrow(row.duration, VALID_DURATION);
  const ageGroup = narrow(row.age_group, VALID_AGE);
  const slug = row.slug;
  const title = row.title;

  if (!category || !media || !duration || !ageGroup) return null;
  if (typeof slug !== "string" || !slug) return null;
  if (typeof title !== "string" || !title) return null;

  const steps = Array.isArray(row.steps)
    ? row.steps.filter((s): s is string => typeof s === "string")
    : [];

  return {
    id: slug,
    title,
    description: typeof row.description === "string" ? row.description : "",
    category,
    media,
    duration,
    durationMinutes:
      typeof row.duration_minutes === "string" ? row.duration_minutes : "",
    ageGroup,
    minPlayers: typeof row.min_players === "number" ? row.min_players : 0,
    maxPlayers: typeof row.max_players === "number" ? row.max_players : 0,
    bahan: typeof row.bahan === "string" ? row.bahan : "",
    emoji: typeof row.emoji === "string" ? row.emoji : "",
    photoSeed: typeof row.photo_seed === "string" ? row.photo_seed : slug,
    steps,
  };
}

export default function CatalogGrid() {
  const [filters, setFilters] = useState<Record<Group, FilterValue>>({
    cat: "semua",
    media: "semua",
    dur: "semua",
    umur: "semua",
  });
  const [items, setItems] = useState<IcebreakerIdea[]>(CATALOG);
  const [live, setLive] = useState(false);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await listPublishedIdeas();
        if (cancelled) return;
        if (!result.ok) {
          setStale(true);
          return;
        }
        const mapped = result.data
          .map(toIdea)
          .filter((idea): idea is IcebreakerIdea => idea !== null);
        if (mapped.length > 0) {
          setItems(mapped);
          setLive(true);
        } else {
          setStale(true);
        }
      } catch {
        if (!cancelled) setStale(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function setFilter(group: Group, value: FilterValue) {
    unlockAudio();
    sfx.click();
    setFilters((p) => ({ ...p, [group]: value }));
  }

  const visible = items.filter((g) => matchGame(g, filters));

  return (
    <>
      <div className="filters" role="group" aria-label="Filter katalog game">
        {GROUPS.map((grp) => (
          <div className="filter-row" key={grp.group}>
            <span className="filter-label" id={`filter-${grp.group}-label`}>
              {grp.label}
            </span>
            <div className="filter-opts" role="group" aria-labelledby={`filter-${grp.group}-label`}>
              {grp.values.map((v) => (
                <button
                  key={v}
                  className={`chip${filters[grp.group] === v ? " is-active" : ""}`}
                  type="button"
                  aria-pressed={filters[grp.group] === v}
                  onClick={() => setFilter(grp.group, v)}
                >
                  {v === "semua" ? "Semua" : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="game-count" aria-live="polite">
        {visible.length} game tampil
        {live ? " · katalog langsung" : stale ? " · katalog bawaan" : ""}
      </p>
      {stale ? (
        <p className="catalog-note">
          Menampilkan katalog bawaan. Katalog online belum bisa dimuat.
        </p>
      ) : null}
      {visible.length === 0 ? (
        <p className="game-empty">
          Belum ada game yang cocok dengan filter ini. Coba longgarkan dulu salah satu
          pilihan. 😅
        </p>
      ) : (
        <div className="catalog-grid">
          {visible.map((g) => (
            <article key={g.id} className="catalog-card">
              <div
                className="card-photo"
                style={{ background: themeFor(g.id) }}
                role="img"
                aria-label={`Ikon ${g.title}`}
              >
                <span aria-hidden="true">{g.emoji}</span>
              </div>
              <div className="card-body">
                <h3 className="card-title">
                  {g.title} <span aria-hidden="true">{g.emoji}</span>
                </h3>
                <p className="card-meta">
                  {DURATION_LABEL[g.duration]} · {g.minPlayers}-
                  {g.maxPlayers} pemain, {g.media === "online" ? "Online" : "Offline"}
                </p>
                <p className="card-desc">{g.description}</p>
                <p className="card-need">
                  <strong>Bahan:</strong> {g.bahan}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}