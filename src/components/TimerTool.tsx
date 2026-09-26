"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, ArrowClockwise, SpeakerHigh } from "@phosphor-icons/react";
import { sfx, unlockAudio } from "@/lib/sound";
import { confettiBurst } from "@/lib/confetti";

const PRESETS = [
  { sec: 30, label: "30 dtk" },
  { sec: 60, label: "1 mnt" },
  { sec: 120, label: "2 mnt" },
  { sec: 300, label: "5 mnt" },
];
const CIRC = 326.7;

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type SoundKind = "alarm" | "gong" | "drumroll" | "applause";

export default function TimerTool() {
  const [total, setTotal] = useState(60);
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const interval = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);

  function stop() {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  }

  function start() {
    unlockAudio();
    if (running) {
      stop();
      setRunning(false);
      return;
    }
    const base = finished ? total : left;
    if (base <= 0) return;
    setFinished(false);
    setRunning(true);
    const endAt = Date.now() + base * 1000;
    interval.current = window.setInterval(() => {
      const remain = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setLeft(remain);
      if (remain <= 0) {
        stop();
        setRunning(false);
        setFinished(true);
        sfx.alarm();
        confettiBurst(24);
      }
    }, 200);
  }

  function reset() {
    stop();
    setRunning(false);
    setFinished(false);
    setLeft(total);
  }

  function soundDemo(kind: SoundKind) {
    unlockAudio();
    sfx.click();
    sfx[kind]();
  }

  const progress = total > 0 ? left / total : 0;

  return (
    <article className="tool-card timer-card">
      <div className="tool-head">
        <h3 className="tool-title">
          <span aria-hidden="true">⏱️</span> Timer + Suara
        </h3>
        <p className="tool-tag">Waktu mundur dengan efek suara</p>
      </div>
      <div className="timer-main">
        <div className={`timer-ring-wrap${finished ? " flash" : ""}`}>
          <svg className="timer-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle className="ring-track" cx="60" cy="60" r="52" />
            <circle
              className="ring-fill"
              cx="60"
              cy="60"
              r="52"
              style={{ strokeDashoffset: CIRC * (1 - progress) }}
            />
          </svg>
          <span className="timer-time" aria-live="polite">
            {fmt(left)}
          </span>
        </div>
      </div>
      <div className="timer-presets" role="group" aria-label="Durasi timer">
        {PRESETS.map((p) => (
          <button
            key={p.sec}
            className={`chip${total === p.sec ? " is-active" : ""}`}
            type="button"
            onClick={() => {
              stop();
              setRunning(false);
              setFinished(false);
              setTotal(p.sec);
              setLeft(p.sec);
              unlockAudio();
              sfx.click();
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="timer-actions">
        <button className="btn btn-primary btn-sm" type="button" onClick={start}>
          {running ? <Pause size={17} weight="bold" /> : <Play size={17} weight="fill" />}
          {running ? "Jeda" : "Mulai"}
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={reset}>
          <ArrowClockwise size={16} /> Ulang
        </button>
      </div>
      <div className="sound-board" role="group" aria-label="Sound board">
        {(["alarm", "gong", "drumroll", "applause"] as SoundKind[]).map((k) => (
          <button key={k} className="chip" type="button" onClick={() => soundDemo(k)}>
            <SpeakerHigh size={15} /> {k}
          </button>
        ))}
      </div>
    </article>
  );
}