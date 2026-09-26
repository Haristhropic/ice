"use client";
import { useState } from "react";
import { CATALOG, type EventCategory, type Media, type Duration, type AgeGroup } from "@/lib/data";
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
    values: ["semua", "quick", "medium"],
  },
  {
    group: "umur",
    label: "Usia",
    values: ["semua", "anak", "dewasa", "lintas"],
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
};

export default function CatalogGrid() {
  const [filters, setFilters] = useState<Record<Group, FilterValue>>({
    cat: "semua",
    media: "semua",
    dur: "semua",
    umur: "semua",
  });

  function setFilter(group: Group, value: FilterValue) {
    unlockAudio();
    sfx.click();
    setFilters((p) => ({ ...p, [group]: value }));
  }

  const visible = CATALOG.filter((g) => matchGame(g, filters));

  return (
    <>
      <div className="filters" aria-label="Filter katalog game">
        {GROUPS.map((grp) => (
          <div className="filter-row" key={grp.group}>
            <span className="filter-label">{grp.label}</span>
            <div className="filter-opts">
              {grp.values.map((v) => (
                <button
                  key={v}
                  className={`chip${filters[grp.group] === v ? " is-active" : ""}`}
                  type="button"
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
      </p>
      {visible.length === 0 ? (
        <p className="game-empty">
          Belum ada game yang cocok dengan filter ini. Coba longgarkan dulu salah satu
          pilihan. 😅
        </p>
      ) : (
        <div className="catalog-grid">
          {visible.map((g) => (
            <article key={g.id} className="catalog-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="card-photo"
                src={`https://picsum.photos/seed/${g.photoSeed}/640/360`}
                alt={`${g.title} icebreaker`}
                width={640}
                height={360}
                loading="lazy"
              />
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