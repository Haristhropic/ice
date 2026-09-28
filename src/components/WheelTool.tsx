"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PencilSimple, X, CircleNotch } from "@phosphor-icons/react";
import { DEFAULT_WHEEL_OPTIONS } from "@/lib/data";
import { sfx, unlockAudio } from "@/lib/sound";
import { confettiBurst } from "@/lib/confetti";
import { randFloat, randIdx } from "@/lib/rand";

const SEG_COLORS = ["#D12F1E", "#FFC53D", "#1FB6A6", "#5B7FFF", "#FF8FB1", "#EC8A00", "#7D5BFF", "#4ECB71"];

/* White text on the yellow/orange/mint segments measures 1.6-2.6:1, which is
   unreadable when projected. Those get the dark ink instead (>= 7:1). */
const LIGHT_SEGMENTS = new Set([1, 5, 7]);

const SPIN_MS = 4000;
const SETTLE_MS = 200;

export default function WheelTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [options, setOptions] = useState(DEFAULT_WHEEL_OPTIONS.join(", "));
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState("Tekan Putar, lihat siapa gilirannya.");
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
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const cx = size / 2,
      cy = size / 2,
      r = size / 2 - 4;
    const n = opts.length;
    const seg = (Math.PI * 2) / n;
    const fontFam =
      getComputedStyle(document.body).getPropertyValue("--font-body").trim() ||
      "sans-serif";

    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    opts.forEach((opt, i) => {
      const start = -Math.PI / 2 + i * seg;
      const end = start + seg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = SEG_COLORS[i % SEG_COLORS.length];
      ctx.fill();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + seg / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = LIGHT_SEGMENTS.has(i) ? "#3a2c22" : "#fff";
      ctx.font = `600 13px ${fontFam}`;
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 3;
      const label = opt.length > 16 ? opt.slice(0, 15) + "…" : opt;
      ctx.fillText(label, r - 14, 4);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }, [parsedOptions]);

  function applyOptions() {
    if (spinning) {
      setResult("Tunggu roda berhenti dulu sebelum ganti daftar.");
      return;
    }
    const opts = parsedOptions();
    if (opts.length < 2) {
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
    setResult("Daftar baru siap. Tekan Putar!");
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
    const extra = 5 + randIdx(4);
    const target = rotation.current + extra * 360 + randFloat(360);
    rotation.current = target;

    // Reduced motion collapses the CSS transition to ~0ms, so waiting the full
    // duration would leave the user staring at a motionless wheel.
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
        const picked = opts[idx];
        setResult(`${picked}. Giliran kamu.`);
        setSpinning(false);
        wheel.style.transition = "none";
        sfx.ding();
        confettiBurst();
      },
      reduced ? 0 : SPIN_MS + SETTLE_MS,
    );
  }

  return (
    <article className="tool-card wheel-card">
      <div className="tool-head">
        <h3 className="tool-title">
          <CircleNotch size={21} weight="bold" aria-hidden="true" /> Roda Keberuntungan
        </h3>
        <p className="tool-tag">Pilih peserta atau tantangan secara acak</p>
      </div>
      <div className="wheel-stage">
        <div className="wheel-wrap">
          <canvas
            ref={canvasRef}
            className="wheel"
            width="280"
            height="280"
            role="img"
            aria-label="Roda keberuntungan"
          />
          <span className="wheel-pointer" aria-hidden="true" />
          <button
            className="wheel-spin btn btn-primary"
            type="button"
            onClick={spin}
            disabled={spinning}
          >
            Putar!
          </button>
        </div>
        <div className="wheel-side">
          <p className="wheel-result" aria-live="polite">
            {result}
          </p>
          <button
            className="link-btn"
            type="button"
            aria-expanded={editing}
            aria-controls="wheel-edit"
            onClick={() => setEditing((p) => !p)}
          >
            {editing ? <X size={15} /> : <PencilSimple size={15} />}
            {editing ? "Tutup editor" : "Edit pilihan"}
          </button>
          {editing && (
            <div className="wheel-edit" id="wheel-edit">
              <label className="visually-hidden" htmlFor="wheel-opts">
                Daftar pilihan roda, pisahkan dengan koma
              </label>
              <textarea
                id="wheel-opts"
                rows={3}
                value={options}
                onChange={(e) => setOptions(e.target.value)}
              />
              <button className="btn btn-ghost btn-sm" type="button" onClick={applyOptions}>
                Pakai daftar ini
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}