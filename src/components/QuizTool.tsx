"use client";
import { useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { SAMPLE_QUIZ } from "@/lib/data";
import { sfx, unlockAudio } from "@/lib/sound";
import { confettiBurst } from "@/lib/confetti";

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

  return (
    <article className="tool-card quiz-card">
      <div className="tool-head">
        <h3 className="tool-title">
          <span aria-hidden="true">📝</span> Kuis Kilat
        </h3>
        <p className="tool-tag">Contoh soal pilihan ganda untuk layar bersama</p>
      </div>
      <p className="quiz-q">{SAMPLE_QUIZ.question}</p>
      <div className="quiz-opts">
        {SAMPLE_QUIZ.options.map((opt, i) => {
          const isCorrect = i === SAMPLE_QUIZ.answerIndex;
          const wrong = done && picked !== null && picked === i && !isCorrect;
          const showCorrect = done && isCorrect;
          return (
            <button
              key={i}
              className={`quiz-opt${showCorrect ? " is-correct" : ""}${wrong ? " is-wrong" : ""}${done ? " locked" : ""}`}
              type="button"
              onClick={() => handlePick(i)}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <p className="quiz-feedback" aria-live="polite">
        {done
          ? picked === SAMPLE_QUIZ.answerIndex
            ? "Benar! Pas untuk kenalan lebih dalam."
            : "Bukan yang ini. Coba tebak lagi besok."
          : ""}
      </p>
      {done && (
        <button className="btn btn-ghost btn-sm" type="button" onClick={reset}>
          <ArrowClockwise size={16} /> Ulangi soal
        </button>
      )}
    </article>
  );
}