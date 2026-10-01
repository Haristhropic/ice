import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted for the same reason as before: the build-time Google Fonts fetch
// times out behind proxies, so ./fonts is committed rather than downloaded.
const archivo = localFont({
  src: [
    { path: "./fonts/Archivo-Variable.woff2", weight: "100 900", style: "normal" },
    {
      path: "./fonts/Archivo-Variable-ext.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-human",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

// Azeret Mono is the printer's face. The human writes in Archivo; the machine
// writes in mono, and the split is load-bearing rather than decorative.
const azeret = localFont({
  src: [
    {
      path: "./fonts/AzeretMono-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/AzeretMono-Variable-ext.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-machine",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: "IceBreaker Hub - Cairkan suasana, mulai dari satu klik",
  description:
    "Koleksi ice breaker digital dan offline untuk kelas, rapat, workshop, dan kumpul keluarga. Buka di laptop, langsung main.",
  metadataBase: new URL("https://icebreakerhub.example.com"),
  openGraph: {
    title: "IceBreaker Hub - Cairkan suasana, mulai dari satu klik",
    description:
      "Koleksi ice breaker digital dan offline untuk kelas, rapat, workshop, dan kumpul keluarga.",
    type: "website",
  },
};

const CONTRACT = `
  THESIS: the console is a thermal receipt printer. One continuous column of
  paper runs the length of the session; every activity prints onto it line by
  line, so the strip you finish with is the record of the session you ran. This
  refuses the tool-grid, the edge rail, the slide-in drawer, and the hero
  headline with a button under it.
  OWN-WORLD: a dark laminate counter with the paper strip lying on it as the
  one bright field. Paper is thermal stock, a cool white with a blue cast, never
  cream. Print is a soft blue-black that never reaches true black, because a
  thermal head cannot print it. One accent only, the tinta biru of a rubber
  stamp. Archivo is the human voice, Azeret Mono the machine's. Elevation is
  declared once: raised means a warm offset shadow, recessed means an inset
  counter window, and flat print gets a dotted rule and nothing else.
  STORY: a facilitator lands mid-session and reads the entire offer off one
  sheet of paper: what this is, six activities, how long each takes, how hard
  each one is. Choosing one tears the menu off the strip and feeds the activity
  down onto fresh paper. Nothing is behind a drawer. The offline catalog and the
  audience notes print further down the same sheet.
  FIRST VIEWPORT: the strip dead centre on the counter, paper filling roughly a
  third of a desktop screen and running the whole scroll height. Top to bottom:
  the printed name, one plain line of Indonesian, a dotted rule, then the six
  activities as numbered menu lines with dotted leaders, durations and a
  difficulty tier. The lines themselves are the primary action, each a 56px
  target. Left gutter carries the machine, the room-code plate and the session
  clock; right gutter carries the human, the presenter controls and the catalog
  jump. On a phone the paper goes edge to edge and the gutters become a fixed
  top strip and a fixed bottom bar.
  FORM: Struk Thermal, 4th of seven grounded candidates under seed 824ea8eb.
  Raised by three declined hands: the bazaar gave every catalog line its own
  stamped tag of origin, the type specimen gave hierarchy by scale alone with no
  ornamental framing, and the child's sampler gave the tools an increasing
  difficulty order so a first-timer's path is legible on the sheet. The segment
  wall and the quilt were competitive and lost; neither is worn as a costume.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, DESIGN.md, and every shipping raster carrying its
  provenance
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${archivo.variable} ${azeret.variable}`}
    >
      <body>
        {/* React strips JSX comments, so the contract below is injected as a real
            HTML comment to survive the production build. */}
        <div hidden dangerouslySetInnerHTML={{ __html: `<!--${CONTRACT}-->` }} />
        {children}
      </body>
    </html>
  );
}
