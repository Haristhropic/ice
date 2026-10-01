"use client";

import { CaretRight } from "@phosphor-icons/react";
import { sfx, unlockAudio } from "@/lib/sound";
import { BANDS, TOOLS, durationLabel, lineNo, type ToolId } from "@/lib/tools";

export default function MenuBlock({
  active,
  onPick,
}: {
  active: ToolId;
  onPick: (id: ToolId) => void;
}) {
  function pick(id: ToolId) {
    unlockAudio();
    sfx.click();
    onPick(id);
  }

  return (
    <section className="block" aria-labelledby="menu-heading">
      <div className="menu-head">
        <h2 className="menu-title" id="menu-heading">
          Pilih aktivitas
        </h2>
        <span className="menu-count">{TOOLS.length} BARIS</span>
      </div>
      <p className="menu-blurb">
        Angkanya urutan tingkat kesulitan. Baris aktif sudah siap jalan.
      </p>

      {/* Two columns, the way a printed order ticket sets its items, so the
          whole offer and the running tool share one viewport. */}
      <div className="menu-cols">
        {BANDS.map((band) => (
          <div className="menu-col" key={band.id}>
            <div className="menu-band">
              <span className="menu-band-name">{band.name}</span>
              <span className="menu-band-line" aria-hidden="true" />
            </div>
            <ul className="menu">
              {TOOLS.filter((t) => t.band === band.id).map((tool) => {
                const no = lineNo(TOOLS.indexOf(tool));
                const isActive = tool.id === active;
                return (
                  <li key={tool.id}>
                    <button
                      className={`menu-line${isActive ? " is-active" : ""}`}
                      type="button"
                      onClick={() => pick(tool.id)}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span className="menu-line-num" aria-hidden="true">
                        {no}
                      </span>
                      <span className="menu-line-body">
                        <span className="menu-line-name">{tool.name}</span>
                        <span className="leader" aria-hidden="true" />
                        <span className="menu-line-dur">
                          {durationLabel(tool.minutes)}
                        </span>
                      </span>
                      <span className="visually-hidden-inline">{tool.blurb}</span>
                      <CaretRight
                        className="menu-line-go"
                        size={17}
                        weight="bold"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
