"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { sfx, unlockAudio } from "@/lib/sound";
import { confettiBurst } from "@/lib/confetti";
import Print from "./Print";

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
    setResult(`${total} klik dalam ${DURATION} detik`);
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
    <div className="tool">
      <p className="print-caption">Ketuk jendela, mesin yang menghitung</p>

      <button
        className="click-target click-bay"
        type="button"
        onClick={handleClick}
      >
        {state === "idle" ? "Ketuk untuk mulai" : state === "running" ? "Ketuk!" : "Selesai"}
      </button>

      <div className="click-stats">
        <p className="click-stat">
          <span className="click-stat-value tnum">{clicks}</span>
          <span className="click-stat-label">klik</span>
        </p>
        <p className="click-stat">
          <span className="click-stat-value tnum">{left}</span>
          <span className="click-stat-label">detik sisa</span>
        </p>
      </div>

      {state === "done" ? (
        <>
          <Print token={result} as="p" className="print-out">
            {result}
          </Print>
          <p className="quiz-feedback">
            Rata-rata {(clicks / DURATION).toFixed(1)} klik per detik.
          </p>
          <div className="keyrow">
            <button className="pkey pkey-quiet" type="button" onClick={restart}>
              <ArrowClockwise size={15} weight="bold" /> Main lagi
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
