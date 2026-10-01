"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PencilSimple, X } from "@phosphor-icons/react";
import { DEFAULT_WHEEL_OPTIONS } from "@/lib/data";
import { sfx, unlockAudio } from "@/lib/sound";
import { confettiBurst } from "@/lib/confetti";
import { randFloat, randIdx } from "@/lib/rand";
import Print from "./Print";

const SPIN_MS = 4000;
const SETTLE_MS = 200;
const SIZE = 300;

/* A thermal head prints one density, not a palette. The disc is dithered with
   three densities so the wedges stay distinguishable from the back of a room
   while the whole thing still reads as printed rather than designed. Ink is the
   only colour on the wheel; the pointer carries the stamp so the eye has
   exactly one place to land. */
const DENSITY = ["#2b2a24", "#8e8b7e", "#cfcab9"];
/* Each wedge's label takes the foreground or the ink depending on its density:
   paper on the dark wedge clears 13:1, ink on the two lighter wedges clears
   5.6:1 and 12:1. A single fixed label colour would fail on both light wedges. */
const LABEL_ON = ["#f4f2ec", "#2b2a24", "#2b2a24"];

export default function WheelTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [options, setOptions] = useState(DEFAULT_WHEEL_OPTIONS.join(", "));
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState("");
  const [spinning, setSpinning] = useState(false);
  const rotation = useRef(0);
  const settleTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
  }, []);

  const parsedOptions = useCallback(
    () =>
      options
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [options],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const opts = parsedOptions();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const r = SIZE / 2 - 3;
    const n = Math.max(opts.length, 1);
    const seg = (Math.PI * 2) / n;
    const mono = "600 12px ui-monospace, monospace";

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#f4f2ec";
    ctx.fill();

    opts.forEach((opt, i) => {
      const start = -Math.PI / 2 + i * seg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = DENSITY[i % DENSITY.length];
      ctx.fill();

      /* Dot-matrix rule between wedges, the way a printed disc separates. */
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(start) * r, cy + Math.sin(start) * r);
      ctx.strokeStyle = "#f4f2ec";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + seg / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = LABEL_ON[i % LABEL_ON.length];
      ctx.font = mono;
      const label = opt.length > 14 ? `${opt.slice(0, 13)}…` : opt;
      ctx.fillText(label.toUpperCase(), r - 12, 4);
      ctx.restore();
    });

    /* Unprinted cells in the hub: the machine's own blank. */
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fillStyle = "#f4f2ec";
    ctx.fill();
    ctx.strokeStyle = "#2b2a24";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [parsedOptions]);

  function applyOptions() {
    if (spinning) {
      setResult("Tunggu roda berhenti dulu sebelum ganti daftar.");
      return;
    }
    if (parsedOptions().length < 2) {
      setResult("Isi minimal 2 pilihan.");
      return;
    }
    setEditing(false);
    rotation.current = 0;
    const wheel = canvasRef.current;
    if (wheel) {
      wheel.style.transition = "none";
      wheel.style.transform = "rotate(0deg)";
    }
    setResult("Daftar baru siap.");
  }

  function spin() {
    if (spinning) return;
    unlockAudio();
    const opts = parsedOptions();
    if (opts.length < 2) {
      setResult("Isi minimal 2 pilihan dulu.");
      return;
    }
    const wheel = canvasRef.current;
    if (!wheel) return;

    setSpinning(true);
    const segDeg = 360 / opts.length;
    const target = rotation.current + (5 + randIdx(4)) * 360 + randFloat(360);
    rotation.current = target;

    /* Reduced motion collapses the transition to ~0ms, so waiting the full
       duration would leave the user staring at a motionless wheel. */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    wheel.style.transition = reduced
      ? "none"
      : `transform ${SPIN_MS}ms cubic-bezier(0.15,0.8,0.2,1)`;
    wheel.style.transform = `rotate(${target}deg)`;

    settleTimer.current = window.setTimeout(
      () => {
        const normalized = ((target % 360) + 360) % 360;
        const pointerAt = 360 - normalized;
        const idx = Math.floor((pointerAt % 360) / segDeg) % opts.length;
        setResult(opts[idx]);
        setSpinning(false);
        wheel.style.transition = "none";
        sfx.ding();
        confettiBurst();
      },
      reduced ? 0 : SPIN_MS + SETTLE_MS,
    );
  }

  return (
    <div className="tool">
      <p className="print-caption">Giliran siapa</p>

      {result ? (
        <Print token={result} as="p" className="print-out">
          {result}
        </Print>
      ) : (
        <p className="print-out print-out-idle">
          Tekan putar, roda mencetak satu nama.
        </p>
      )}

      <div className="wheel-bay">
        <div className="wheel-plate">
          <canvas
            ref={canvasRef}
            className="wheel-disc"
            width={SIZE}
            height={SIZE}
            role="img"
            aria-label="Roda"
          />
          <span className="wheel-pointer" aria-hidden="true" />
          <button
            className="wheel-hub"
            type="button"
            onClick={spin}
            disabled={spinning}
          >
            {spinning ? "Berputar" : "Putar"}
          </button>
        </div>

        <div className="wheel-side">
          <dl className="facts">
            <div className="fact">
              <dt>Pilihan</dt>
              <span className="leader" aria-hidden="true" />
              <dd>{parsedOptions().length}</dd>
            </div>
          </dl>
          <div className="keyrow">
            <button
              className="pkey pkey-stamp"
              type="button"
              onClick={spin}
              disabled={spinning}
            >
              Putar
            </button>
            <button
              className="pkey pkey-quiet pkey-sm"
              type="button"
              aria-expanded={editing}
              aria-controls="wheel-edit"
              onClick={() => setEditing((p) => !p)}
            >
              {editing ? <X size={14} weight="bold" /> : <PencilSimple size={14} weight="bold" />}
              {editing ? "Tutup" : "Ganti daftar"}
            </button>
          </div>
          {editing ? (
            <div className="wheel-edit" id="wheel-edit">
              <label className="field-label" htmlFor="wheel-opts">
                Nama per baris, atau pisahkan dengan koma
              </label>
              <textarea
                id="wheel-opts"
                className="print-textarea"
                rows={4}
                value={options}
                onChange={(e) => setOptions(e.target.value)}
              />
              <button
                className="pkey pkey-quiet pkey-sm"
                type="button"
                onClick={applyOptions}
              >
                Pakai daftar ini
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
