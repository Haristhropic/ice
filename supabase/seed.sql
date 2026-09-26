-- =====================================================================
-- IceBreaker Hub - seed data
--
-- Run AFTER supabase/schema.sql.
-- Moves the 6 catalog entries that are currently hardcoded in
-- src/lib/data.ts into Postgres, so /admin has real content to manage.
--
-- Idempotent: re-running updates the existing rows instead of duplicating.
-- =====================================================================

insert into public.icebreaker_ideas (
  slug, title, description, category, media, duration, duration_minutes,
  age_group, min_players, max_players, bahan, emoji, photo_seed, steps
)
values
  (
    'simon-says',
    'Simon Berkata',
    'Ikuti perintah hanya jika dimulai dengan "Simon berkata". Salah sedikit, keluar dulu.',
    'kelas',
    'offline',
    'quick',
    '1-3',
    'anak',
    5,
    30,
    'Tidak ada. Cukup ruang untuk berdiri.',
    '👂',
    'simon-says-party',
    '[
      "Semua berdiri menghadap fasilitator.",
      "Fasilitator memberi perintah, dengan atau tanpa awalan ''Simon berkata''.",
      "Yang ikut perintah tanpa awalan dianggap salah dan keluar untuk putaran ini.",
      "Orang terakhir yang bertahan jadi pemenang."
    ]'::jsonb
  ),
  (
    'two-truths-lie',
    'Two Truths, One Lie',
    'Setiap orang menyebut dua fakta dan satu bohong. Tebak mana yang palsu.',
    'rapat',
    'offline',
    'medium',
    '5-10',
    'lintas',
    4,
    20,
    'Tidak ada.',
    '🤥',
    'two-truths-lie',
    '[
      "Setiap orang menulis dua kebenaran dan satu kebohongan tentang dirinya.",
      "Secara bergiliran, baca ketiganya ke grup.",
      "Audien vote mana yang bohong, lalu orang itu membuka kartunya."
    ]'::jsonb
  ),
  (
    'human-knot',
    'Simpul Manusia',
    'Berdiri melingkar, pegang tangan yang bukan di sampingmu, lalu urai simpul tanpa lepas.',
    'workshop',
    'offline',
    'medium',
    '5-10',
    'lintas',
    8,
    15,
    'Tidak ada. Ruang cukup luas.',
    '🪢',
    'human-knot-team',
    '[
      "Semua berdiri melingkar dan memejamkan mata.",
      "Rentangkan tangan ke tengah, pegang dua tangan orang lain (bukan orang di samping).",
      "Buka mata, lalu urai simpul tanpa melepas genggaman."
    ]'::jsonb
  ),
  (
    'charades',
    'Tebak Gaya',
    'Peragakan kata atau film tanpa suara. Tim menebak sebelum waktu habis.',
    'pesta',
    'offline',
    'medium',
    '5-10',
    'lintas',
    6,
    30,
    'Kertas berisi daftar kata.',
    '🎭',
    'charades-party',
    '[
      "Bagi peserta jadi dua tim.",
      "Satu orang maju dan mendapat kata rahasia.",
      "Peragakan tanpa suara, tim menebak dalam batas waktu."
    ]'::jsonb
  ),
  (
    'one-word',
    'Satu Kata',
    'Tema dibacakan, tiap orang jawab dengan satu kata paling cepat lewat chat.',
    'rapat',
    'online',
    'quick',
    '1-3',
    'dewasa',
    4,
    50,
    'Fitur chat di Zoom atau Teams.',
    '🗨️',
    'zoom-call-meeting',
    '[
      "Host membacakan tema, misal: ''energi kamu hari ini?''.",
      "Semua kirim satu kata di chat secepatnya.",
      "Host baca beberapa jawaban paling kocak sebagai pembuka diskusi."
    ]'::jsonb
  ),
  (
    'name-move',
    'Nama + Gerakan',
    'Sebut nama sambil bikin gerakan. Semua menirukan, lalu lanjut ke orang berikutnya.',
    'kelas',
    'online',
    'quick',
    '1-3',
    'anak',
    4,
    30,
    'Kamera menyala.',
    '🙌',
    'name-game-camp',
    '[
      "Orang pertama menyebut nama sambil membuat satu gerakan.",
      "Semua menirukan nama dan gerakan itu.",
      "Lanjut ke orang berikutnya; makin lama makin panjang rantainya."
    ]'::jsonb
  )
on conflict (slug) do update
  set title            = excluded.title,
      description      = excluded.description,
      category         = excluded.category,
      media            = excluded.media,
      duration         = excluded.duration,
      duration_minutes = excluded.duration_minutes,
      age_group        = excluded.age_group,
      min_players      = excluded.min_players,
      max_players      = excluded.max_players,
      bahan            = excluded.bahan,
      emoji            = excluded.emoji,
      photo_seed       = excluded.photo_seed,
      steps            = excluded.steps,
      updated_at       = now();


-- ---------------------------------------------------------------------
-- Sanity check. Expect 6 rows.
-- ---------------------------------------------------------------------
select slug, title, category, media, duration, is_published
  from public.icebreaker_ideas
 order by slug;
