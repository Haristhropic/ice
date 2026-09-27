"use client";
import { useState } from "react";
import { Eye, EyeSlash, ArrowClockwise } from "@phosphor-icons/react";
import { RIDDLES } from "@/lib/data";
import { sfx, unlockAudio } from "@/lib/sound";
import { randIdx } from "@/lib/rand";

export default function RiddleTool() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const riddle = RIDDLES[idx % RIDDLES.length];

  function next() {
    unlockAudio();
    setShow(false);
    if (RIDDLES.length > 1) {
      let candidate = randIdx(RIDDLES.length);
      while (candidate === idx) candidate = randIdx(RIDDLES.length);
      setIdx(candidate);
    }
  }

  return (
    <article className="tool-card emoji-card">
      <div className="tool-head">
        <h3 className="tool-title">
          <span aria-hidden="true">🕵️</span> Tebak Emoji
        </h3>
        <p className="tool-tag">Teka-teki frase dari rangkaian emoji</p>
      </div>
      <p className="riddle-emojis" aria-live="polite">
        {riddle.emojis}
      </p>
      <p className={`riddle-answer${show ? "" : " hidden"}`} id="rid-answer">
        {riddle.answer}
      </p>
      <div className="riddle-actions">
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          aria-expanded={show}
          aria-controls="rid-answer"
          onClick={() => {
            unlockAudio();
            const nextShow = !show;
            setShow(nextShow);
            if (nextShow) sfx.ding();
          }}
        >
          {show ? <EyeSlash size={17} /> : <Eye size={17} />}
          {show ? "Sembunyikan" : "Buka jawaban"}
        </button>
        <button className="btn btn-primary btn-sm" type="button" onClick={next}>
          <ArrowClockwise size={17} weight="bold" /> Ganti teka-teki
        </button>
      </div>
    </article>
  );
}