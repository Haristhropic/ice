/* Data statis lokal. Bentuknya nyaris 1:1 dengan tabel Supabase
   di PRD §5 (`icebreaker_ideas`, seed untuk `custom_templates`). */

export type Category = "formal" | "fun" | "deep" | "kids";

export const QUESTIONS: Record<Category, string[]> = {
  formal: [
    "Kalau bisa undang siapa saja ke acara makan malam, siapa orangnya?",
    "Skill apa yang kamu mau pelajari tahun ini?",
    "Proyek paling berkesan yang pernah kamu kerjakan apa?",
    "Rekomendasi buku atau film yang mengubah cara kamu berpikir?",
    "Kalau kerja remote gratis ke mana saja, kota mana kamu pilih?",
  ],
  fun: [
    "Makanan apa yang bikin kamu langsung senang?",
    "Kalau jadi hewan selama sehari, mau jadi hewan apa?",
    "Hal paling konyol yang pernah kamu beli secara impulsif?",
    "Superpower paling berguna untuk hari Senin apa?",
    "Lagu apa yang paling kamu hafal untuk karaoke dadakan?",
  ],
  deep: [
    "Hal kecil apa hari ini yang bikin kamu bersyukur?",
    "Kebiasaan apa yang paling mau kamu ubah dari dirimu?",
    "Siapa orang yang paling memengaruhi cara kamu berpikir?",
    "Apa definisi sukses untuk kamu saat ini?",
    "Ketakutan apa yang paling ingin kamu hadapi?",
  ],
  kids: [
    "Hewan apa yang paling ingin kamu ajak bicara?",
    "Kalau bisa bikin rasa es krim baru, rasa apa?",
    "Hal paling seru hari ini di sekolah apa?",
    "Superpower apa yang kamu mau pas bangun tidur?",
    "Kalau punya satu juta rupiah, mau dibelikan apa?",
  ],
};

export interface Riddle {
  clues: string[];
  answer: string;
}

export const RIDDLES: Riddle[] = [
  {
    clues: ["Turun dari langit", "Bikin kita basah-basahan", "Payung jadi teman"],
    answer: "Hujan-hujanan",
  },
  {
    clues: ["Panas dan pekat", "Diminum sebelum matahari terbit", "Biar otak ikut bangun"],
    answer: "Kopi buka mata pagi",
  },
  {
    clues: ["Empat kaki di atas pedal", "Bikin tetangga ingin pindah", "Tetap santai sambil fokus"],
    answer: "Kucing main piano",
  },
  {
    clues: ["Layar gelap di meja makan", "Cuma tiga puluh menit", "Rasanya jadi lebih enak"],
    answer: "Makan sambil matikan HP",
  },
  {
    clues: ["Balon di tangan", "Lilin yang belum ditiup", "Semua ikut berteriak"],
    answer: "Ulang tahun kejutan",
  },
  {
    clues: ["Buku laptop tertinggal", "Pasir menggantikan lantai kantor", "Panggilan daring dari bawah payung"],
    answer: "Remote work dari pantai",
  },
  {
    clues: ["Es batu di gelas", "Sudah pelan-pelan hangat", "Mulai dari obrolan ringan"],
    answer: "Suasana yang sedang mencair",
  },
  {
    clues: ["Bahu bersentuhan", "Satu target untuk semua orang", "Saling menutupi kekurangan"],
    answer: "Kerja sama tim",
  },
];

/* Fase 1: wheel demo. Nanti tersimpan per-user di custom_templates. */
export const DEFAULT_WHEEL_OPTIONS = [
  "Dance battle",
  "Tebak suara siapa",
  "30 detik karaoke",
  "Cerita kocak 1 menit",
  "Sebut 1 fakta random",
  "Tiru gaya robot",
];

export type Media = "online" | "offline";
export type Duration = "quick" | "medium" | "long";
export type AgeGroup = "anak" | "remaja" | "dewasa" | "lintas";
export type EventCategory = "kelas" | "rapat" | "workshop" | "pesta";

export interface IcebreakerIdea {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  media: Media;
  duration: Duration;
  durationMinutes: string;
  ageGroup: AgeGroup;
  minPlayers: number;
  maxPlayers: number;
  bahan: string;
  photoSeed: string;
  steps: string[];
}

/* Mirip PRD §5 `icebreaker_ideas`: title, category, players,
   duration, media, age_group, steps. Foto pakai picsum seed. */
export const CATALOG: IcebreakerIdea[] = [
  {
    id: "simon-says",
    title: "Simon Berkata",
    description:
      'Ikuti perintah hanya jika dimulai dengan "Simon berkata". Salah sedikit, keluar dulu.',
    category: "kelas",
    media: "offline",
    duration: "quick",
    durationMinutes: "1-3",
    ageGroup: "anak",
    minPlayers: 5,
    maxPlayers: 30,
    bahan: "Tidak ada. Cukup ruang untuk berdiri.",
    photoSeed: "simon-says-party",
    steps: [
      "Semua berdiri menghadap fasilitator.",
      "Fasilitator memberi perintah, dengan atau tanpa awalan 'Simon berkata'.",
      "Yang ikut perintah tanpa awalan dianggap salah dan keluar untuk putaran ini.",
      "Orang terakhir yang bertahan jadi pemenang.",
    ],
  },
  {
    id: "two-truths-lie",
    title: "Two Truths, One Lie",
    description:
      "Setiap orang menyebut dua fakta dan satu bohong. Tebak mana yang palsu.",
    category: "rapat",
    media: "offline",
    duration: "medium",
    durationMinutes: "5-10",
    ageGroup: "lintas",
    minPlayers: 4,
    maxPlayers: 20,
    bahan: "Tidak ada.",
    photoSeed: "two-truths-lie",
    steps: [
      "Setiap orang menulis dua kebenaran dan satu kebohongan tentang dirinya.",
      "Secara bergiliran, baca ketiganya ke grup.",
      "Audien vote mana yang bohong, lalu orang itu membuka kartunya.",
    ],
  },
  {
    id: "human-knot",
    title: "Simpul Manusia",
    description:
      "Berdiri melingkar, pegang tangan yang bukan di sampingmu, lalu urai simpul tanpa lepas.",
    category: "workshop",
    media: "offline",
    duration: "medium",
    durationMinutes: "5-10",
    ageGroup: "lintas",
    minPlayers: 8,
    maxPlayers: 15,
    bahan: "Tidak ada. Ruang cukup luas.",
    photoSeed: "human-knot-team",
    steps: [
      "Semua berdiri melingkar dan memejamkan mata.",
      "Rentangkan tangan ke tengah, pegang dua tangan orang lain (bukan orang di samping).",
      "Buka mata, lalu urai simpul tanpa melepas genggaman.",
    ],
  },
  {
    id: "charades",
    title: "Tebak Gaya",
    description: "Peragakan kata atau film tanpa suara. Tim menebak sebelum waktu habis.",
    category: "pesta",
    media: "offline",
    duration: "medium",
    durationMinutes: "5-10",
    ageGroup: "lintas",
    minPlayers: 6,
    maxPlayers: 30,
    bahan: "Kertas berisi daftar kata.",
    photoSeed: "charades-party",
    steps: [
      "Bagi peserta jadi dua tim.",
      "Satu orang maju dan mendapat kata rahasia.",
      "Peragakan tanpa suara, tim menebak dalam batas waktu.",
    ],
  },
  {
    id: "one-word",
    title: "Satu Kata",
    description: "Tema dibacakan, tiap orang jawab dengan satu kata paling cepat lewat chat.",
    category: "rapat",
    media: "online",
    duration: "quick",
    durationMinutes: "1-3",
    ageGroup: "dewasa",
    minPlayers: 4,
    maxPlayers: 50,
    bahan: "Fitur chat di Zoom atau Teams.",
    photoSeed: "zoom-call-meeting",
    steps: [
      "Host membacakan tema, misal: 'energi kamu hari ini?'.",
      "Semua kirim satu kata di chat secepatnya.",
      "Host baca beberapa jawaban paling kocak sebagai pembuka diskusi.",
    ],
  },
  {
    id: "name-move",
    title: "Nama + Gerakan",
    description: "Sebut nama sambil bikin gerakan. Semua menirukan, lalu lanjut ke orang berikutnya.",
    category: "kelas",
    media: "online",
    duration: "quick",
    durationMinutes: "1-3",
    ageGroup: "anak",
    minPlayers: 4,
    maxPlayers: 30,
    bahan: "Kamera menyala.",
    photoSeed: "name-game-camp",
    steps: [
      "Orang pertama menyebut nama sambil membuat satu gerakan.",
      "Semua menirukan nama dan gerakan itu.",
      "Lanjut ke orang berikutnya; makin lama makin panjang rantainya.",
    ],
  },
];

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

export const SAMPLE_QUIZ: QuizQuestion = {
  question: 'Ice breaker "Two Truths, One Lie" paling pas untuk tujuan apa?',
  options: [
    "Tes matematika kilat",
    "Kenalan lebih dalam",
    "Pengumuman anggaran",
    "Istirahat ngopi",
  ],
  answerIndex: 1,
};