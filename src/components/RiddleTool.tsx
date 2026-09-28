"use client";
import { useState } from "react";
import { Eye, EyeSlash, ArrowClockwise, PuzzlePiece } from "@phosphor-icons/react";
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
    <article className="tool-card riddle-card">
      <div className="tool-head">
        <h3 className="tool-title">
          <PuzzlePiece size={21} weight="bold" aria-hidden="true" /> Tebak Frasa
        </h3>
        <p className="tool-tag">Tebak frasa dari tiga petunjuk singkat</p>
      </div>
      <ol className="riddle-clues" aria-live="polite">
        {riddle.clues.map((clue, i) => (
          <li key={clue}>
            <span className="riddle-clue-num" aria-hidden="true">
              {i + 1}
            </span>
            {clue}
          </li>
        ))}
      </ol>
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