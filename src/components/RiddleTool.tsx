"use client";
import { useState } from "react";
import { Eye, EyeSlash, ArrowClockwise } from "@phosphor-icons/react";
import { RIDDLES } from "@/lib/data";
import { sfx, unlockAudio } from "@/lib/sound";
import { randIdx } from "@/lib/rand";
import Stamp from "./Stamp";

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
    <div className="tool">
      <p className="print-caption">Petunjuk, dibuka berurutan</p>

      <ol className="clues" aria-live="polite">
        {riddle.clues.map((clue, i) => (
          <li className="clue" key={clue}>
            <span className="clue-num" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="leader" aria-hidden="true" />
            <span>{clue}</span>
          </li>
        ))}
      </ol>

      <div className="keyrow">
        <button
          className="pkey pkey-quiet"
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
          {show ? <EyeSlash size={15} weight="bold" /> : <Eye size={15} weight="bold" />}
          {show ? "Tutup" : "Buka jawaban"}
        </button>
        <button className="pkey pkey-stamp" type="button" onClick={next}>
          <ArrowClockwise size={15} weight="bold" /> Teori lain
        </button>
      </div>

      {show ? (
        <div className="answer-flap" id="rid-answer">
          <Stamp>Jawaban</Stamp>
          <p className="answer-flap-value">{riddle.answer}</p>
        </div>
      ) : null}
    </div>
  );
}
