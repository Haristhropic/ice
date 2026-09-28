"use client";
import { useRef, useState } from "react";
import { DiceFive, ChatCircleDots } from "@phosphor-icons/react";
import { QUESTIONS, type Category } from "@/lib/data";
import { sfx, unlockAudio } from "@/lib/sound";
import { randIdx } from "@/lib/rand";

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

  function pick(c: Category) {
    const pool = QUESTIONS[c];
    let next = pool[randIdx(pool.length)];
    if (next === last.current[c] && pool.length > 1) {
      next = pool[(pool.indexOf(next) + 1) % pool.length];
    }
    last.current = { ...last.current, [c]: next };
    setQ(next);
    sfx.ding();
  }

  return (
    <article className="tool-card question-card">
      <div className="tool-head">
        <h3 className="tool-title">
          <ChatCircleDots size={21} weight="bold" aria-hidden="true" /> Generator Pertanyaan
        </h3>
        <p className="tool-tag">Would you rather sampai pertanyaan seru</p>
      </div>
      <div className="q-cats" role="group" aria-label="Kategori pertanyaan">
        {CATS.map((c) => (
          <button
            key={c.id}
            className={`chip${cat === c.id ? " is-active" : ""}`}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => {
              unlockAudio();
              setCat(c.id);
              pick(c.id);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="q-text" aria-live="polite">
        {q}
      </p>
      <button
        className="btn btn-primary btn-sm"
        type="button"
        onClick={() => {
          unlockAudio();
          pick(cat);
        }}
      >
        <DiceFive size={18} weight="bold" /> Pertanyaan lain
      </button>
    </article>
  );
}