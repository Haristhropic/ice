"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  DeviceMobile,
  GearSix,
  MonitorPlay,
  Printer,
} from "@phosphor-icons/react";
import { LogoMark } from "./LogoMark";
import MenuBlock from "./MenuBlock";
import Tear from "./Tear";
import CatalogBlock from "./CatalogBlock";
import AudienceBlock from "./AudienceBlock";
import WheelTool from "./WheelTool";
import QuestionTool from "./QuestionTool";
import RiddleTool from "./RiddleTool";
import TimerTool from "./TimerTool";
import ClickGame from "./ClickGame";
import QuizTool from "./QuizTool";
import { TOOLS, TOOL_BY_ID, bandName, lineNo, type ToolId } from "@/lib/tools";

const CATALOG_ANCHOR = "katalog";

export default function Console() {
  const [tool, setTool] = useState<ToolId>("wheel");
  /* Every activity that has been run, newest first, so the strip becomes the
     record of the session rather than a log the facilitator never sees. */
  const [ran, setRan] = useState<{ id: ToolId; at: string }[]>([]);
  const startedAt = useRef<number>(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const active = TOOL_BY_ID.get(tool) ?? TOOLS[0];

  useEffect(() => {
    const id = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, []);

  const clock = useRef(
    new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  );

  function pick(next: ToolId) {
    if (next === tool) return;
    const at = clock.current.format(new Date());
    setRan((list) => [{ id: next, at }, ...list].slice(0, 8));
    setTool(next);
  }

  const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  function goFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#mesin">
        Langsung ke alat yang jalan
      </a>

      {/* THE MACHINE. What the printer knows: what it has printed, and for how
          long the roll has been feeding. */}
      <aside className="gutter gutter-left" aria-label="Mesin">
        <div className="instrument">
          <p className="instrument-label">No. struk</p>
          <p className="code-plate">
            <span className="instrument-value">
              {String(ran.length + 1).padStart(4, "0")}
            </span>
          </p>
        </div>
        <div className="instrument">
          <p className="instrument-label">Lama jalan</p>
          <p className="instrument-value tnum">
            {hours}:{minutes}:{seconds}
          </p>
        </div>
        <div className="instrument">
          <p className="instrument-label">Kode room</p>
          <p className="instrument-say">
            Belum ada. Ruangan ikut belum dibangun, jadi tidak ada kode untuk
            dibagikan.
          </p>
        </div>
        <button
          className="key key-block"
          type="button"
          onClick={() => window.print()}
        >
          <Printer size={17} weight="bold" aria-hidden="true" /> Cetak struk
        </button>
      </aside>

      <main className="strip" id="mesin">
        <section className="block block-lead">
          <div className="nameplate">
            <span className="nameplate-mark" aria-hidden="true">
              <LogoMark size={24} />
            </span>
            <h1 className="nameplate-name">IceBreaker Hub</h1>
            <p className="nameplate-strap">
              Enam aktivitas. Buka di browser, tanpa install, tanpa akun.
            </p>
          </div>
        </section>

        <MenuBlock active={tool} onPick={pick} />

        <Tear label="POTONG" />

        <section className="block" id="alat" aria-labelledby="alat-heading">
          <div className="segment is-current torn-feed" key={tool}>
            <div className="segment-head">
              <span className="segment-num">
                {lineNo(TOOLS.indexOf(active))}
              </span>
              <h2 className="segment-name" id="alat-heading">
                {active.name}
              </h2>
              <span className="segment-tier">{bandName(active.band)}</span>
              <span className="segment-time">SIAP</span>
            </div>

            {tool === "wheel" ? <WheelTool /> : null}
            {tool === "question" ? <QuestionTool /> : null}
            {tool === "riddle" ? <RiddleTool /> : null}
            {tool === "timer" ? <TimerTool /> : null}
            {tool === "click" ? <ClickGame /> : null}
            {tool === "quiz" ? <QuizTool /> : null}
          </div>
        </section>

        {ran.length > 0 ? (
          <>
            <div className="block-history">
              <div className="menu-band">
                <span className="menu-band-name">Riwayat</span>
                <span className="menu-band-line" aria-hidden="true" />
              </div>
              <ol className="history">
                {ran.map((entry, i) => {
                  const done = TOOL_BY_ID.get(entry.id);
                  if (!done) return null;
                  return (
                    <li className="history-row" key={`${entry.id}-${entry.at}-${i}`}>
                      <span className="history-num" aria-hidden="true">
                        {lineNo(TOOLS.indexOf(done))}
                      </span>
                      <span className="history-name">{done.name}</span>
                      <span className="leader" aria-hidden="true" />
                      <span className="history-at mono">{entry.at}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <Tear />
          </>
        ) : null}

        <section className="block" id={CATALOG_ANCHOR} aria-labelledby="katalog-heading">
          <div className="menu-head">
            <h2 className="menu-title" id="katalog-heading">
              Katalog game offline
            </h2>
            <span className="menu-count">TANPA ALAT</span>
          </div>
          <p className="menu-blurb">
            Kumpulan game yang tidak butuh gadget. Cetak struk ini kalau mau
            dibawa ke ruang sebelah.
          </p>
          <CatalogBlock />
        </section>

        <AudienceBlock />

        <Tear />
      </main>

      {/* THE HUMAN. What the facilitator drives. */}
      <aside className="gutter gutter-right" aria-label="Kendali presenter">
        <button className="key key-block key-stamp" type="button" onClick={goFullscreen}>
          <MonitorPlay size={17} weight="bold" aria-hidden="true" /> Mode presentasi
        </button>
        <Link className="key key-block" href="/room">
          <DeviceMobile size={17} weight="bold" aria-hidden="true" /> Peserta masuk
          dengan kode
        </Link>
        <button
          className="key key-block"
          type="button"
          onClick={() =>
            document
              .getElementById(CATALOG_ANCHOR)
              ?.scrollIntoView({ block: "start" })
          }
        >
          <ArrowUp size={17} weight="bold" aria-hidden="true" /> Lompat ke katalog
        </button>
        <Link className="key key-block" href="/admin">
          <GearSix size={17} weight="bold" aria-hidden="true" /> Admin
        </Link>
        <p className="gutter-note">
          Tekan F11 untuk layar penuh. Struk ini bisa dicetak sebagai catatan sesi
          lewat Cetak struk.
        </p>
      </aside>
    </div>
  );
}
