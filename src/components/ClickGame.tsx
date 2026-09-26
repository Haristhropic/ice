"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { sfx, unlockAudio } from "@/lib/sound";
import { confettiBurst } from "@/lib/confetti";

type State = "idle" | "running" | "done";

const DURATION = 10;

export default function ClickGame() {
  const [state, setState] = useState<State>("idle");
  const [clicks, setClicks] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [result, setResult] = useState("");
  const interval = useRef<number | null>(null);
  const clicksRef = useRef(0);

  useEffect(() => {
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);

  function finish() {
    const total = clicksRef.current;
    setState("done");
    setLeft(0);
    setResult(`${total} klik dalam 10 detik (${(total / DURATION).toFixed(1)} klik/detik)`);
    if (total >= 25) {
      sfx.ding();
      confettiBurst();
    } else {
      sfx.alarm();
    }
  }

  function handleClick() {
    unlockAudio();
    if (state === "done") return;

    if (state === "idle" && interval.current === null) {
      setState("running");
      setResult("");
      const endAt = Date.now() + DURATION * 1000;
      interval.current = window.setInterval(() => {
        const remain = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
        setLeft(remain);
        if (remain <= 0) {
          if (interval.current) {
            clearInterval(interval.current);
            interval.current = null;
          }
          finish();
        }
      }, 200);
      return;
    }

    if (state === "running") {
      clicksRef.current += 1;
      setClicks(clicksRef.current);
      sfx.click();
    }
  }

  function restart() {
    setState("idle");
    setClicks(0);
    clicksRef.current = 0;
    setLeft(DURATION);
    setResult("");
  }

  return (
    <article className="game-card click-card">
      <div className="tool-head">
        <h3 className="tool-title">
          <span aria-hidden="true">👆</span> Cepat-Tepat Klik
        </h3>
        <p className="tool-tag">Berapa klik kamu dalam 10 detik?</p>
      </div>
      <button
        className={`click-target${state === "done" ? " done" : ""}`}
        type="button"
        onClick={handleClick}
      >
        {state === "running" ? "KLIK! 🔥" : "Klik aku secepat mungkin!"}
      </button>
      <div className="click-stats">
        <p className="click-count">
          <strong>{clicks}</strong> klik
        </p>
        <p className="click-remain">
          sisa <strong>{left}</strong> detik
        </p>
      </div>
      {state === "done" && (
        <>
          <p className="click-result" aria-live="polite">
            {result}
          </p>
          <button className="btn btn-ghost btn-sm" type="button" onClick={restart}>
            <ArrowClockwise size={16} /> Main lagi
          </button>
        </>
      )}
    </article>
  );
}