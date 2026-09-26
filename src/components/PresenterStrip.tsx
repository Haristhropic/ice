import Reveal from "./Reveal";

export default function PresenterStrip() {
  return (
    <section className="presenter">
      <Reveal>
        <div className="presenter-bubble" aria-hidden="true">
          🖥️
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <div className="presenter-copy">
          <h2>Mode Presenter, satu tombol.</h2>
          <p>
            Tampilkan alat ke layar penuh, bebas iklan dan tombol nganggur. Siap
            diproyeksikan atau dishare di Zoom.
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.12}>
        <a className="btn btn-primary" href="#alat">
          Buka semua alat
        </a>
      </Reveal>
    </section>
  );
}