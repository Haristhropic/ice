"use client";

/* Confetti ringan: layer fixed, partikel span, dihapus setelah animasi. */

const COLORS = ["#D12F1E", "#FFC53D", "#1FB6A6", "#5B7FFF", "#FF8FB1"];

function reducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function confettiBurst(n = 36) {
  if (reducedMotion() || typeof document === "undefined") return;

  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  document.body.appendChild(layer);

  for (let i = 0; i < n; i++) {
    const p = document.createElement("span");
    p.className = "confetti-piece";
    p.style.left = 8 + Math.random() * 84 + "%";
    p.style.top = "-12px";
    p.style.background = COLORS[i % COLORS.length];
    p.style.width = 6 + Math.random() * 6 + "px";
    p.style.height = 6 + Math.random() * 6 + "px";
    p.style.animationDelay = Math.random() * 0.4 + "s";
    p.style.animationDuration = 2.2 + Math.random() * 1.2 + "s";
    layer.appendChild(p);
  }

  window.setTimeout(() => layer.remove(), 4200);
}