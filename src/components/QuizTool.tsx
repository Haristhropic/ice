"use client";
import { useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { SAMPLE_QUIZ } from "@/lib/data";
import { sfx, unlockAudio } from "@/lib/sound";
import { confettiBurst } from "@/lib/confetti";
import Stamp from "./Stamp";

export default function QuizTool() {
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  function handlePick(i: number) {
    if (done) return;
    unlockAudio();
    setDone(true);
    setPicked(i);
    if (i === SAMPLE_QUIZ.answerIndex) {
      sfx.ding();
      confettiBurst();
    } else {
      sfx.alarm();
    }
  }

  function reset() {
    setDone(false);
    setPicked(null);
  }

  const right = picked === SAMPLE_QUIZ.answerIndex;

  return (
    <div className="tool">
      <p className="print-caption">Soal pilihan ganda</p>
      <p className="quiz-q">{SAMPLE_QUIZ.question}</p>

      <div className="prows" role="group" aria-label="Pilihan jawaban">
        {SAMPLE_QUIZ.options.map((opt, i) => {
          const isCorrect = i === SAMPLE_QUIZ.answerIndex;
          const wrong = done && picked === i && !isCorrect;
          const reveal = done && isCorrect;
          return (
            <button
              key={i}
              className={`prow${reveal ? " is-correct" : ""}${wrong ? " is-wrong" : ""}${done ? " is-locked" : ""}`}
              type="button"
              disabled={done}
              onClick={() => handlePick(i)}
            >
              <span className="prow-key" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      <p className="quiz-feedback" aria-live="polite">
        {done
          ? right
            ? "Benar. Pas untuk kenalan lebih dalam."
            : "Belum tepat. Jawaban yang benar sudah dicap."
          : ""}
      </p>

      {done ? (
        <div className="keyrow">
          {right ? <Stamp>Tepat</Stamp> : null}
          <button className="pkey pkey-quiet" type="button" onClick={reset}>
            <ArrowClockwise size={15} weight="bold" /> Ulangi soal
          </button>
        </div>
      ) : null}
    </div>
  );
}
