import type { Icon } from "@phosphor-icons/react";
import {
  CircleNotch,
  CursorClick,
  DiceFive,
  ListChecks,
  PuzzlePiece,
  Timer as TimerIcon,
} from "@phosphor-icons/react";

export type ToolId = "timer" | "click" | "wheel" | "question" | "quiz" | "riddle";

export type BandId = "mudah" | "sedang";

export type Tool = {
  id: ToolId;
  /** The name the human reads on the menu line. */
  name: string;
  /** One line of Indonesian saying what the machine does with it. */
  blurb: string;
  /** Minutes, printed at the end of the dotted leader. */
  minutes: number;
  band: BandId;
  Icon: Icon;
};

/* The split is drawn from what the facilitator has to DO, not from how playful a
   tool feels: one band runs from a single click with no setup, the other needs
   them to read, deliver or judge something in the room. That is the question a
   first-time teacher actually has. */
export const BANDS: { id: BandId; name: string }[] = [
  { id: "mudah", name: "Sekali klik" },
  { id: "sedang", name: "Butuh kamu baca" },
];

/* Three per band, so the menu prints in two columns and the running tool still
   lands inside the first viewport. The number on a line is its rank in this
   order, so the printed number carries the path rather than decorating it. */
export const TOOLS: Tool[] = [
  {
    id: "timer",
    name: "Timer + Suara",
    blurb: "Batas waktu dengan alarm, gong, dan tepuk tangan.",
    minutes: 5,
    band: "mudah",
    Icon: TimerIcon,
  },
  {
    id: "click",
    name: "Klik Cepat",
    blurb: "Hitung klik dalam 10 detik, layar besar untuk kelas.",
    minutes: 2,
    band: "mudah",
    Icon: CursorClick,
  },
  {
    id: "wheel",
    name: "Roda",
    blurb: "Pilih peserta, nama, atau tantangan secara acak.",
    minutes: 2,
    band: "mudah",
    Icon: CircleNotch,
  },
  {
    id: "question",
    name: "Pertanyaan",
    blurb: "Kartu pertanyaan per kategori, satu klik untuk ambil.",
    minutes: 5,
    band: "sedang",
    Icon: DiceFive,
  },
  {
    id: "quiz",
    name: "Kuis",
    blurb: "Pilihan ganda, langsung ketahuan mana yang benar.",
    minutes: 10,
    band: "sedang",
    Icon: ListChecks,
  },
  {
    id: "riddle",
    name: "Tebak",
    blurb: "Petunjuk bertahap, dijawab bersama-sama.",
    minutes: 10,
    band: "sedang",
    Icon: PuzzlePiece,
  },
];

export const TOOL_BY_ID = new Map(TOOLS.map((t) => [t.id, t]));

export function lineNo(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function bandName(id: BandId) {
  return BANDS.find((b) => b.id === id)?.name ?? "";
}

export function durationLabel(minutes: number) {
  return `${minutes} mnt`;
}
