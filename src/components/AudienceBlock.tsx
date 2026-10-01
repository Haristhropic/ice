const AUDIENCES = [
  {
    who: "Pendidik",
    span: "3-5 mnt",
    says: "Mulai kelas 5 menit pertama dengan senyum, bukan dengusan.",
  },
  {
    who: "Fasilitator HR",
    span: "5-10 mnt",
    says: "Cairkan rapat bulanan dan townhall, profesional tapi tetap seru.",
  },
  {
    who: "Event Host",
    span: "10+ mnt",
    says: "Game panggung, undian mini, dan kuis kilat untuk audiens ramai.",
  },
  {
    who: "Keluarga & Teman",
    span: "Santai",
    says: "Permainan santai dan pertanyaan deep talk buat kumpul rumah.",
  },
];

export default function AudienceBlock() {
  return (
    <section className="block" aria-labelledby="audiens-heading">
      <div className="menu-head">
        <h2 className="menu-title" id="audiens-heading">
          Untuk siapa
        </h2>
        <span className="menu-count">SEMUA UKURAN RUANG</span>
      </div>

      <dl className="aud-list">
        {AUDIENCES.map((a) => (
          <div className="aud-row" key={a.who}>
            <dt className="aud-head">
              <span className="aud-who">{a.who}</span>
              <span className="leader" aria-hidden="true" />
              <span className="tag">{a.span}</span>
            </dt>
            <dd className="aud-says">{a.says}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
