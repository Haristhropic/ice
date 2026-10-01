"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowClockwise,
  ArrowLeft,
  MonitorPlay,
  SignIn,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import {
  ROOM_CODE_PATTERN,
  ROOM_GAME_OPTIONS,
  ROOM_STATUS_OPTIONS,
  findActiveRoomByCode,
  type PublicRoom,
} from "@/lib/supabase/queries";
import Tear from "./Tear";
import Print from "./Print";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; room: PublicRoom }
  | { kind: "missing" }
  | { kind: "error"; message: string };

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

const STATUS_LABEL: Record<string, string> = {
  waiting: "Host belum mulai",
  playing: "Sesi berjalan",
  ended: "Sesi sudah selesai",
};

/* Where each hosted game can be practised locally. The room tells you which
   game the host picked; these are the same games already on the home strip, so
   a player can warm up on their own phone instead of staring at a spinner. */
const PRACTICE_TARGET: Record<
  NonNullable<PublicRoom["active_game_type"]>,
  { row: number; label: string }
> = {
  click_race: { row: 2, label: "Klik Cepat" },
  quiz: { row: 5, label: "Kuis" },
  wheel: { row: 3, label: "Roda" },
};

export default function JoinStage() {
  const [code, setCode] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function lookup(raw: string) {
    const clean = raw.trim().toUpperCase();
    if (!ROOM_CODE_PATTERN.test(clean)) {
      setState({
        kind: "error",
        message: "Kode room harus 4-8 karakter huruf kapital atau angka.",
      });
      return;
    }

    setState({ kind: "loading" });
    const result = await findActiveRoomByCode(clean);
    if (!result.ok) {
      setState({ kind: "error", message: result.error });
      return;
    }
    setState(result.data ? { kind: "found", room: result.data } : { kind: "missing" });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await lookup(code);
  }

  const loading = state.kind === "loading";
  const room = state.kind === "found" ? state.room : null;
  const status = room
    ? ROOM_STATUS_OPTIONS.find((entry) => entry.value === room.status)
    : undefined;
  const game = room
    ? ROOM_GAME_OPTIONS.find((entry) => entry.value === room.active_game_type)
    : undefined;
  const practice = room?.active_game_type
    ? PRACTICE_TARGET[room.active_game_type]
    : null;

  return (
    <div className="stub-wrap">
      <a className="skip-link" href="stub">Langsung ke kode</a>

      <p className="stub-where">
        <Link className="key key-flat" href="/">
          <ArrowLeft size={16} weight="bold" aria-hidden="true" /> Kembali ke
          beranda
        </Link>
      </p>

      <article className="stub" id="stub">
        <p className="print-caption">Tiket peserta</p>
        <h1 className="stub-title">Masuk pakai kode</h1>
        <p className="stub-lede">
          Ketik kode yang tampil di layar host. Tidak perlu akun, tidak perlu
          install.
        </p>

        <Tear />

        <form className="stub-form" onSubmit={onSubmit} noValidate>
          <label className="field-label" htmlFor="room-code-input">
            Kode room
          </label>
          <input
            id="room-code-input"
            className="stub-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="A2ADA"
            maxLength={8}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            enterKeyHint="go"
            aria-describedby="room-hint"
          />
          <p className="stub-hint" id="room-hint">
            4-8 karakter huruf kapital dan angka, misalnya A2ADA.
          </p>
          <button className="pkey pkey-stamp key-block" type="submit" disabled={loading}>
            <SignIn size={16} weight="bold" />
            {loading ? "Mencari..." : "Masuk"}
          </button>
        </form>

        <div className="stub-result" aria-live="polite" aria-busy={loading}>
          {room ? (
            <>
              <Print token={room.room_code} as="p" className="stub-code-out">
                {room.room_code}
              </Print>

              <dl className="facts">
                <div className="fact">
                  <dt>Status</dt>
                  <span className="leader" aria-hidden="true" />
                  <dd>{status?.label ?? STATUS_LABEL[room.status] ?? room.status}</dd>
                </div>
                <div className="fact">
                  <dt>Game</dt>
                  <span className="leader" aria-hidden="true" />
                  <dd>{game?.label ?? "Belum dipilih"}</dd>
                </div>
                <div className="fact">
                  <dt>Dibuat</dt>
                  <span className="leader" aria-hidden="true" />
                  <dd>{dateFmt.format(new Date(room.created_at))}</dd>
                </div>
              </dl>

              {room.status === "waiting" ? (
                <p className="stub-note">
                  <UsersThree size={17} weight="bold" aria-hidden="true" />
                  Host belum memulai sesi. Siap-siap dulu, lalu tekan cek ulang
                  begitu host membuka sesi.
                </p>
              ) : null}

              {practice ? (
                <div className="stub-note">
                  <MonitorPlay size={17} weight="bold" aria-hidden="true" />
                  <span>
                    Sesi ini memakai {practice.label}. Baris {String(practice.row).padStart(2, "0")}{" "}
                    di beranda punya versi lokal — cobain sambil menunggu host.
                  </span>
                </div>
              ) : null}

              <button
                className="pkey pkey-quiet key-block"
                type="button"
                onClick={() => void lookup(room.room_code)}
                disabled={loading}
              >
                <ArrowClockwise size={15} weight="bold" /> Cek ulang
              </button>
            </>
          ) : null}

          {state.kind === "missing" ? (
            <p className="stub-note is-error">
              <Warning size={17} weight="bold" aria-hidden="true" />
              Kode tidak ditemukan, atau room-nya sudah selesai. Periksa lagi
              kodenya dengan host.
            </p>
          ) : null}

          {state.kind === "error" ? (
            <p className="stub-note is-error">
              <Warning size={17} weight="bold" aria-hidden="true" />
              {state.message}
            </p>
          ) : null}
        </div>
      </article>
    </div>
  );
}
