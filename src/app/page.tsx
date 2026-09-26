import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import WheelTool from "@/components/WheelTool";
import QuestionTool from "@/components/QuestionTool";
import RiddleTool from "@/components/RiddleTool";
import TimerTool from "@/components/TimerTool";
import ClickGame from "@/components/ClickGame";
import QuizTool from "@/components/QuizTool";
import CatalogGrid from "@/components/CatalogGrid";
import PersonaGrid from "@/components/PersonaGrid";
import PresenterStrip from "@/components/PresenterStrip";
import CtaBlock from "@/components/CtaBlock";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <a className="skip-link" href="#alat">
        Langsung ke alat
      </a>
      <Nav />
      <main id="top">
        <Hero />
        <Marquee />

        {/* tools hub */}
        <section className="section" id="alat">
          <div className="section-head">
            <Reveal>
              <h2>Empat alat, siap main bareng.</h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="section-sub">
                Semua berjalan di browser. Proyeksikan ke layar, atau share screen di
                Zoom. Peserta cukup lihat.
              </p>
            </Reveal>
          </div>
          <div className="tools-grid">
            <WheelTool />
            <QuestionTool />
            <RiddleTool />
            <TimerTool />
          </div>
        </section>

        {/* micro games */}
        <section className="section" id="game">
          <div className="section-head">
            <Reveal>
              <h2>Game singkat, seru langsung.</h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="section-sub">
                Dua contoh pertandingan kilat. Bagian kuis versi ruangan (Pin Room)
                menyusul di fase berikutnya.
              </p>
            </Reveal>
          </div>
          <div className="games-grid">
            <ClickGame />
            <QuizTool />
          </div>
        </section>

        {/* katalog offline */}
        <section className="section" id="katalog">
          <div className="section-head">
            <Reveal>
              <p className="eyebrow">Katalog offline</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2>Tanpa gadget juga bisa seru.</h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="section-sub">
                Panduan lengkap dengan jumlah pemain, durasi, bahan, dan instruksi
                langkah demi langkah.
              </p>
            </Reveal>
          </div>
          <Reveal>
            <CatalogGrid />
          </Reveal>
        </section>

        <PersonaGrid />
        <PresenterStrip />
        <CtaBlock />
      </main>
      <Footer />
    </>
  );
}