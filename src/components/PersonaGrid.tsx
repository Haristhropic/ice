import Reveal from "./Reveal";

const personas = [
  {
    emoji: "🧑‍🏫",
    title: "Pendidik",
    text: "Mulai kelas 5 menit pertama dengan senyum, bukan dengusan.",
  },
  {
    emoji: "💼",
    title: "Fasilitator HR",
    text: "Cairkan rapat bulanan dan townhall, profesional tapi tetap seru.",
  },
  {
    emoji: "🎤",
    title: "Event Host",
    text: "Game panggung, undian mini, dan kuis kilat untuk audiens ramai.",
  },
  {
    emoji: "🏠",
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
        {personas.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06}>
            <article className="persona">
              <span className="persona-emoji" aria-hidden="true">
                {p.emoji}
              </span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}