"use client";
import { ChalkboardTeacher, UsersThree, MicrophoneStage, Users } from "@phosphor-icons/react";
import Reveal from "./Reveal";

const personas = [
  {
    Icon: ChalkboardTeacher,
    title: "Pendidik",
    text: "Mulai kelas 5 menit pertama dengan senyum, bukan dengusan.",
  },
  {
    Icon: UsersThree,
    title: "Fasilitator HR",
    text: "Cairkan rapat bulanan dan townhall, profesional tapi tetap seru.",
  },
  {
    Icon: MicrophoneStage,
    title: "Event Host",
    text: "Game panggung, undian mini, dan kuis kilat untuk audiens ramai.",
  },
  {
    Icon: Users,
    title: "Keluarga & Teman",
    text: "Permainan santai dan pertanyaan deep talk buat kumpul rumah.",
  },
];

export default function PersonaGrid() {
  return (
    <section className="section" id="untuk">
      <div className="section-head">
        <Reveal>
          <h2>Dibuat untuk yang bawa suasana.</h2>
        </Reveal>
      </div>
      <div className="persona-grid">
        {personas.map(({ Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.06}>
            <article className="persona">
              <span className="persona-icon" aria-hidden="true">
                <Icon size={40} weight="light" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
