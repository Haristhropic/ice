"use client";
import { useRef, useState } from "react";
import { QUESTIONS, type Category } from "@/lib/data";
import { sfx, unlockAudio } from "@/lib/sound";
import { randIdx } from "@/lib/rand";
import Print from "./Print";

const CATS: { id: Category; label: string }[] = [
  { id: "formal", label: "Formal" },
  { id: "fun", label: "Fun" },
  { id: "deep", label: "Deep" },
  { id: "kids", label: "Kids" },
];

export default function QuestionTool() {
  const [cat, setCat] = useState<Category>("formal");
  const [q, setQ] = useState(QUESTIONS.formal[0]);
  const last = useRef<Record<Category, string>>({
    formal: QUESTIONS.formal[0],
    fun: "",
    deep: "",
    kids: "",
  });

  function draw(c: Category) {
    const pool = QUESTIONS[c];
    let next = pool[randIdx(pool.length)];
    if (next === last.current[c] && pool.length > 1) {
      next = pool[(pool.indexOf(next) + 1) % pool.length];
    }
    last.current = { ...last.current, [c]: next };
    setQ(next);
    sfx.ding();
  }

  function choose(c: Category) {
    unlockAudio();
    setCat(c);
    draw(c);
  }

  return (
    <div className="tool">
      <p className="print-caption">Kartu pertanyaan</p>
      <Print token={q} as="p" className="print-out">
        {q}
      </Print>

      <div className="q-cats" role="group" aria-label="Kategori pertanyaan">
        {CATS.map((c) => (
          <button
            key={c.id}
            className={`fchip${cat === c.id ? " is-on" : ""}`}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => choose(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="keyrow">
        <button
          className="pkey pkey-stamp"
          type="button"
          onClick={() => {
            unlockAudio();
            draw(cat);
          }}
        >
          Kartu lain
        </button>
      </div>
    </div>
  );
}
