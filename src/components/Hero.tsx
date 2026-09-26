import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow">Ice breaker instan, tanpa instalasi</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1>
              Cairkan suasananya,{" "}
              <span className="hero-accent">satu klik</span> aja.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="hero-sub">
              Ice breaker digital dan offline untuk kelas, rapat, workshop, dan kumpul
              keluarga. Buka di laptop, langsung main.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#alat">
                Mulai sekarang
              </a>
              <a className="btn btn-ghost" href="#katalog">
                Lihat katalog
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal className="hero-visual" delay={0.1}>
          <div className="hero-stack" aria-hidden="true">
            <article className="hero-card hc-1">
              <span className="hero-card-tag">Tanya</span>
              <p className="hero-card-q">
                Kalau bisa jadi hewan selama sehari, kamu jadi hewan apa?
              </p>
              <span className="hero-card-foot">Generator Pertanyaan</span>
            </article>
            <article className="hero-card hc-2">
              <span className="hero-card-tag">Spin</span>
              <p className="hero-card-q">
                Roda memilih siapa yang mulai dance battle duluan.
              </p>
              <span className="hero-card-foot">Roda Keberuntungan</span>
            </article>
            <article className="hero-card hc-3">
              <span className="hero-card-tag">Gaya</span>
              <p className="hero-card-q">
                Peragakan &ldquo;kue ulang tahun&rdquo; tanpa bersuara, tim menebak.
              </p>
              <span className="hero-card-foot">Katalog Offline</span>
            </article>
          </div>
        </Reveal>
      </div>
      <div className="hero-blob" aria-hidden="true" />
    </section>
  );
}