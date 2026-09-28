"use client";
import { Confetti } from "@phosphor-icons/react";
import Reveal from "./Reveal";

export default function CtaBlock() {
  return (
    <section className="cta-block" id="mulai">
      <div className="cta-inner">
        <Reveal>
          <p className="cta-icon" aria-hidden="true">
            <Confetti size={54} weight="light" />
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2>Siap mencairkan suasana acara berikutnya?</h2>
        </Reveal>
        <Reveal delay={0.12}>
          <a className="btn btn-primary btn-lg" href="#alat">
            Mulai sekarang
          </a>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="cta-note">Gratis, tanpa daftar akun.</p>
        </Reveal>
      </div>
    </section>
  );
}