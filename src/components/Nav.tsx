"use client";
import { useEffect, useState } from "react";
import {
  List,
  SpeakerHigh,
  SpeakerX,
  ArrowsOutSimple,
  ArrowsInSimple,
} from "@phosphor-icons/react";
import { isMuted, setMuted, unlockAudio } from "@/lib/sound";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => !isMuted());
  const [fs, setFs] = useState(false);

  // sinkron status fullscreen (Esc = keluar fullscreen di luar toggle)
  useEffect(() => {
    const onFsChange = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  function toggleSound() {
    unlockAudio();
    const next = !soundOn;
    setSoundOn(next);
    setMuted(!next);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* ok */
    }
  }

  return (
    <header className="nav" role="banner">
      <div className="nav-inner">
        <a className="logo" href="#top" aria-label="IceBreaker Hub, ke atas">
          <span className="logo-mark" aria-hidden="true">🧊</span>
          <span className="logo-word">
            IceBreaker<span>Hub</span>
          </span>
        </a>
        <nav
          className={`nav-links${open ? " open" : ""}`}
          id="nav-links"
          aria-label="Menu utama"
        >
          <a href="#alat" onClick={() => setOpen(false)}>Alat</a>
          <a href="#game" onClick={() => setOpen(false)}>Game</a>
          <a href="#katalog" onClick={() => setOpen(false)}>Katalog</a>
          <a href="#untuk" onClick={() => setOpen(false)}>Untuk kamu</a>
        </nav>
        <div className="nav-actions">
          <button
            className="icon-btn"
            type="button"
            aria-pressed={soundOn}
            aria-label={soundOn ? "Matikan suara" : "Nyalakan suara"}
            onClick={toggleSound}
          >
            {soundOn ? <SpeakerHigh size={20} /> : <SpeakerX size={20} />}
          </button>
          <button
            className="icon-btn"
            type="button"
            aria-label={fs ? "Keluar dari Mode Presenter" : "Mode Presenter"}
            aria-pressed={fs}
            onClick={toggleFullscreen}
          >
            {fs ? <ArrowsInSimple size={20} /> : <ArrowsOutSimple size={20} />}
          </button>
          <a className="btn btn-primary btn-sm" href="#mulai">
            Mulai sekarang
          </a>
          <button
            className="nav-burger icon-btn"
            type="button"
            aria-label="Buka menu"
            aria-expanded={open}
            aria-controls="nav-links"
            onClick={() => setOpen((p) => !p)}
          >
            <List size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}