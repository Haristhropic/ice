# Product Requirement Document (PRD) - IceBreaker Hub

| Metadata | Detail |
| ----- | ----- |
| **Product Name** | IceBreaker Hub (Tentative) |
| **Document Version** | 1.0.0 |
| **Status** | Draft / Planning |
| **Target Audience** | Guru/Dosen, Facilitator/HR, Event Organizer, Komunitas, Umum |
| **Platform** | Web Application (Desktop & Mobile Friendly) |
| **Core Goal** | Menyediakan platform ice breaking serbaguna, interaktif, dan mudah digunakan tanpa hambatan teknis untuk semua kalangan |

---

## 1. Product Overview & Objectives

### 1.1 Visi Produk
**IceBreaker Hub** adalah platform web interaktif yang menyediakan berbagai koleksi dan alat *ice breaking* digital maupun non-digital untuk mencairkan suasana di berbagai acara—mulai dari kelas pembelajaran, rapat kantor, workshop, hingga kumpul keluarga dan acara komunitas.

### 1.2 Tujuan Utama (Objectives)
* **Aksesibilitas Tinggi:** Dapat digunakan dengan instan tanpa harus selalu mewajibkan peserta untuk *login* atau mengunduh aplikasi.
* **Keberagaman Metode:** Menyediakan alat interaktif langsung (*live tools*) dan panduan aktivitas fisik/tanpa gadget (*offline games*).
* **Adaptif untuk Semua Kalangan:** Filter kategori berdasarkan ukuran audiens, kelompok usia (anak-anak, remaja, profesional, senior), dan format acara (Online/Zoom vs Offline/Tatap Muka).
* **Kemudahan Host/Fasilitator:** Layar khusus tampilan presenter (*Presenter View*) yang bersih, bebas iklan pengganggu, dan mudah dikontrol.

---

## 2. Target User Personas

1. **Pendidik (Guru & Dosen)**
   * **Kebutuhan:** Memulai kelas dengan segar, mengembalikan fokus murid, game singkat 3-5 menit.
2. **HR / Corporate Facilitator / Team Lead**
   * **Kebutuhan:** Mencairkan suasana rapat bulanan/townhall, aktivitas *team building*, profesional tapi tetap menyenangkan.
3. **Event Organizer / Community Host**
   * **Kebutuhan:** Aktivitas panggung untuk audiens besar, kuis interaktif, undian mini/games cepat.
4. **Umum / Kumpul Keluarga & Teman**
   * **Kebutuhan:** Permainan santai (*party games*), pertanyaan *deep talk* atau komedi ringan.

---

## 3. Core Features & Functional Requirements

### 3.1 Fitur Utama (Core Modules)

#### A. Interactive Tools Hub (Fitur Live Web Tool)
Permainan interaktif yang diproyeksikan ke layar utama oleh Fasilitator/Host:
1. **Roda Keberuntungan (*Spin the Wheel*):**
   * Memilih nama peserta acak atau tantangan acak.
   * Template opsi yang bisa di-edit cepat.
2. **Generator Pertanyaan (*Would You Rather* & *Get-to-Know-You*):**
   * Menampilkan pertanyaan menarik secara acak sesuai topik (Formal, Fun, Deep, Kids).
3. **Tebak Gambar / Emoticon (*Image & Emoji Riddle*):**
   * Menebak kata/frasa berdasarkan rangkaian emoji atau potongan gambar yang di-blur secara bertahap.
4. **Timer & Sound Effects (*Game Master Utility*):**
   * Penghitung waktu mundur interaktif dengan efek suara (alarm, tepuk tangan, drum roll, gong) untuk memandu game manual.

#### B. Direct-Play Micro Games (Pertandingan Singkat)
1. **Cepat-Tepat Klik (*Click Speed Test / Reaction Test*):**
   * Game cepat 10 detik untuk menguji refleks audiens.
2. **Kuis Pilihan Ganda Singkat:**
   * Host dapat membagikan Kode QR / Pin Room pendek agar audiens bisa ikut berpartisipasi lewat smartphone masing-masing.

#### C. Katalog Game Offline & Panduan Non-Digital
* Database panduan *ice breaking* tanpa gadget (contoh: *Simon Says*, *2 Truths 1 Lie*, *Human Knot*).
* Dilengkapi dengan:
  * Jumlah pemain ideal.
  * Durasi estimasi.
  * Bahan/Properti yang dibutuhkan.
  * Instruksi langkah demi langkah & tips fasilitator.

#### D. Smart Filter & Recommendation Engine
* Filter pencarian game berdasarkan:
  * **Kategori Acara:** Workshop, Kelas, Rapat Kantor, Pesta Casual.
  * **Media:** Online (Zoom/Teams), Hybrid, Offline (Physical).
  * **Durasi:** Quick (1-3 menit), Medium (5-10 menit), Long (>15 menit).
  * **Kelompok Usia:** Anak-Anak, Remaja, Dewasa / Profesional, Lintas Usia.

### 3.2 User Experience (UX) & Mode Tampilan

* **Host / Presenter View:** Tampilan penuh (*Fullscreen mode*) khusus diproyeksikan ke layar proyektor atau *screen-sharing* Zoom. Bebas gangguan UI berlebih.
* **Quick Start (No Auth Needed):** Fasilitator dapat langsung memilih game dan memainkannya dalam 1 klik tanpa harus mendaftar akun terlebih dahulu.
* **Customization (Untuk User Terdaftar):** Menyimpan daftar game favorit, membuat roda putar kustom, dan menyimpan bank soal kuis sendiri.

---

## 4. Technical Architecture & Stack

### 4.1 Recommended Tech Stack
* **Frontend:** Next.js (React) + Tailwind CSS + Framer Motion (untuk animasi yang mulus & menarik).
* **Realtime Engine (untuk Game Multiplayer Room):** Socket.io / Supabase Realtime.
* **Backend & Database:** Supabase (PostgreSQL for Auth, Custom Saved Templates, & Game Analytics).
* **Hosting:** Vercel.

### 4.2 Data Flow Overview
```
[ Host Browser ] ---> Choose Icebreaker Module ---> Instant Render (Local State)
         |
         +--> (Optional) Create Room Code ---> [ Realtime Server ]
                                                     ^
                                                     |
                                            [ Participant Mobile ]
```

---

## 5. Database Schema Overview (Supabase / PostgreSQL)

1. **`users`**
   * `id`, `email`, `role` (`free`, `premium`, `admin`), `created_at`
2. **`icebreaker_ideas`** (Katalog Game Non-Digital)
   * `id`, `title`, `description`, `category`, `min_players`, `max_players`, `duration_minutes`, `is_online_friendly`, `age_group`, `steps` (JSON)
3. **`custom_templates`** (Template Roda/Kuis yang Disimpan User)
   * `id`, `user_id`, `tool_type` (`wheel`, `quiz`, `question_generator`), `title`, `content_data` (JSON), `created_at`
4. **`game_rooms`** (Untuk Game Interaktif Realtime)
   * `id`, `room_code`, `host_id`, `active_game_type`, `status` (`waiting`, `playing`, `ended`)

---

## 6. Non-Functional Requirements

1. **Kemudahan Penggunaan (Usability):** Layout intuitif dengan tombol berukuran besar (mudah diakses dari HP maupun laptop).
2. **Sensitivitas Konten:** Semua pertanyaan dan modul *game* di-curate agar aman (*safe for work / school-friendly*), bebas dari konten SARA atau ofensif.
3. **Performa:** Waktu pemuatan halaman di bawah 1.5 detik agar siap digunakan kapan pun saat suasana acara membutuhkan pencair suasana mendadak.
4. **Responsivitas:** UI teroptimasi baik saat mode *Desktop Screen Share* maupun *Mobile Browser*.

---

## 7. Roadmap & Enhancements

* **Fase 1 (MVP):**
  * Katalog game offline + Smart Filter.
  * *Spin the wheel tool* & *Question Generator*.
  * Interactive Timer & Sound Board.
* **Fase 2:**
  * Fitur Room Code (Peserta join via HP).
  * Custom Template Builder (simpan roda & kuis buatan sendiri).
* **Fase 3:**
  * Mode AI Assistant: *"Rekomendasikan game untuk 20 orang karyawan yang sedang mengantuk saat rapat sore"*.