"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, ArrowClockwise } from "@phosphor-icons/react";
import { sfx, unlockAudio } from "@/lib/sound";
import { confettiBurst } from "@/lib/confetti";

const PRESETS = [
  { sec: 30, label: "30 dtk" },
  { sec: 60, label: "1 mnt" },
  { sec: 120, label: "2 mnt" },
  { sec: 300, label: "5 mnt" },
];

type SoundKind = "alarm" | "gong" | "drumroll" | "applause";

const SOUND_LABELS: Record<SoundKind, string> = {
  alarm: "Alarm",
  gong: "Gong",
  drumroll: "Gum roll",
  applause: "Tepuk tangan",
};

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

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

  const pct = total > 0 ? (left / total) * 100 : 0;

  return (
    <div className="tool">
      {/* The one instrument a facilitator reads from across the room, so it is
          recessed into the counter rather than printed on the paper. */}
      <div className="window timer-readout">
        <p className="window-value tnum" aria-live="polite">
          <span className={finished ? "is-done" : running ? "is-running" : ""}>
            {fmt(left)}
          </span>
        </p>
        <div
          className="gauge"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={left}
          aria-label="Sisa waktu"
        >
          <span
            className={`gauge-fill${finished ? " is-done" : ""}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="window-label">
          {finished ? "Waktu habis" : running ? "Berjalan" : "Siap"}
        </p>
      </div>

      <div className="timer-set">
        <p className="print-caption">Set durasi</p>
        <div className="q-cats" role="group" aria-label="Durasi timer">
          {PRESETS.map((p) => (
            <button
              key={p.sec}
              className={`fchip${total === p.sec ? " is-on" : ""}`}
              type="button"
              aria-pressed={total === p.sec}
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
      </div>

      <div className="keyrow">
        <button className="pkey pkey-stamp" type="button" onClick={start}>
          {running ? (
            <Pause size={15} weight="fill" />
          ) : (
            <Play size={15} weight="fill" />
          )}
          {running ? "Jeda" : "Mulai"}
        </button>
        <button className="pkey pkey-quiet" type="button" onClick={reset}>
          <ArrowClockwise size={15} weight="bold" /> Ulang
        </button>
      </div>

      <div className="sound-board" role="group" aria-label="Papan suara">
        {(["alarm", "gong", "drumroll", "applause"] as SoundKind[]).map((k) => (
          <button
            key={k}
            className="fchip"
            type="button"
            onClick={() => {
              unlockAudio();
              sfx.click();
              sfx[k]();
            }}
          >
            {SOUND_LABELS[k]}
          </button>
        ))}
      </div>
    </div>
  );
}
