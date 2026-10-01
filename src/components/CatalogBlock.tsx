"use client";

import { useEffect, useState } from "react";
import { Warning } from "@phosphor-icons/react";
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

const GROUPS: { group: Group; label: string; values: string[] }[] = [
  { group: "cat", label: "Acara", values: ["semua", "kelas", "rapat", "workshop", "pesta"] },
  { group: "media", label: "Gadget", values: ["semua", "offline", "online"] },
  { group: "dur", label: "Durasi", values: ["semua", "quick", "medium", "long"] },
  { group: "umur", label: "Usia", values: ["semua", "anak", "remaja", "dewasa", "lintas"] },
];

const DURATION_LABEL: Record<Duration, string> = {
  quick: "1-3 mnt",
  medium: "5-10 mnt",
  long: "15+ mnt",
};

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
   filter and an unknown duration would print "undefined". */
function toIdea(input: unknown): IcebreakerIdea | null {
  if (typeof input !== "object" || input === null) return null;
  const row = input as Record<string, unknown>;

  const category = narrow(row.category, VALID_CATEGORY);
  const media = narrow(row.media, VALID_MEDIA);
  const duration = narrow(row.duration, VALID_DURATION);
  const ageGroup = narrow(row.age_group, VALID_AGE);

  if (!category || !media || !duration || !ageGroup) return null;
  if (typeof row.slug !== "string" || !row.slug) return null;
  if (typeof row.title !== "string" || !row.title) return null;

  const steps = Array.isArray(row.steps)
    ? row.steps.filter((s): s is string => typeof s === "string")
    : [];

  return {
    id: row.slug,
    title: row.title,
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
    photoSeed: typeof row.photo_seed === "string" ? row.photo_seed : row.slug,
    steps,
  };
}

function matches(
  g: (typeof CATALOG)[number],
  f: Record<Group, string>,
): boolean {
  return (
    (f.cat === "semua" || g.category === (f.cat as EventCategory)) &&
    (f.media === "semua" || g.media === (f.media as Media)) &&
    (f.dur === "semua" || g.duration === (f.dur as Duration)) &&
    (f.umur === "semua" || g.ageGroup === (f.umur as AgeGroup))
  );
}

export default function CatalogBlock() {
  const [filters, setFilters] = useState<Record<Group, string>>({
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

  function setFilter(group: Group, value: string) {
    unlockAudio();
    sfx.click();
    setFilters((p) => ({ ...p, [group]: value }));
  }

  const visible = items.filter((g) => matches(g, filters));

  return (
    <>
      <div className="cat-filters" role="group" aria-label="Saring katalog game">
        {GROUPS.map((grp) => (
          <div className="cat-row" key={grp.group}>
            <span className="cat-row-label" id={`cat-${grp.group}-label`}>
              {grp.label}
            </span>
            <div
              className="cat-opts"
              role="group"
              aria-labelledby={`cat-${grp.group}-label`}
            >
              {grp.values.map((v) => (
                <button
                  key={v}
                  className={`fchip${filters[grp.group] === v ? " is-on" : ""}`}
                  type="button"
                  aria-pressed={filters[grp.group] === v}
                  onClick={() => setFilter(grp.group, v)}
                >
                  {v === "semua"
                    ? "Semua"
                    : v === "offline"
                      ? "Tanpa gadget"
                      : v === "online"
                        ? "Pakai layar"
                        : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="menu-count" aria-live="polite">
        {visible.length} game tampil
        {live ? " · dari server" : stale ? " · katalog bawaan" : ""}
      </p>

      {stale ? (
        <p className="stub-note is-warning">
          <Warning size={17} weight="bold" aria-hidden="true" />
          Katalog online belum bisa dimuat, jadi yang tampil adalah bawaan.
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="cat-empty">
          Belum ada game yang cocok dengan saringan ini. Longgarkan salah satu
          dulu.
        </p>
      ) : (
        <ol className="cat-list">
          {visible.map((g, i) => (
            <li className="cat-item" key={g.id}>
              <span className="cat-item-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="cat-item-name">{g.title}</h3>
                <p className="cat-item-desc">{g.description}</p>
                <div className="cat-item-tags">
                  <span
                    className={`tag ${g.media === "offline" ? "tag-offline" : ""}`}
                  >
                    {g.media === "offline" ? "Tanpa gadget" : "Pakai layar"}
                  </span>
                  <span className="tag">{DURATION_LABEL[g.duration]}</span>
                  {g.minPlayers > 0 ? (
                    <span className="tag">
                      {g.minPlayers}-{g.maxPlayers} orang
                    </span>
                  ) : null}
                  {g.bahan ? <span className="tag">{g.bahan}</span> : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
