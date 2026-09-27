"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, SignIn, Warning } from "@phosphor-icons/react";
import {
  ROOM_CODE_PATTERN,
  ROOM_GAME_OPTIONS,
  ROOM_STATUS_OPTIONS,
  findActiveRoomByCode,
  type PublicRoom,
} from "@/lib/supabase/queries";

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

export default function RoomLookup() {
  const [code, setCode] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = code.trim().toUpperCase();
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

  const status =
    state.kind === "found"
      ? ROOM_STATUS_OPTIONS.find((entry) => entry.value === state.room.status)
      : undefined;
  const game =
    state.kind === "found"
      ? ROOM_GAME_OPTIONS.find((entry) => entry.value === state.room.active_game_type)
      : undefined;

  return (
    <div className="room-wrap">
      <header className="room-topbar">
        <Link className="room-back" href="/">
          <ArrowLeft size={16} weight="bold" /> Kembali ke beranda
        </Link>
      </header>

      <main className="room-main">
        <article className="tool-card room-card">
          <div className="tool-head">
            <h1 className="tool-title">
              <span aria-hidden="true">📱</span> Gabung Room
            </h1>
            <p className="tool-tag">Masukkan kode yang tampil di layar host</p>
          </div>

          <form className="room-form" onSubmit={onSubmit} noValidate>
            <label className="room-label" htmlFor="room-code-input">
              Kode room
            </label>
            <input
              id="room-code-input"
              className="room-input"
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
            <p className="room-hint" id="room-hint">
              4-8 karakter huruf kapital dan angka, misalnya A2ADA.
            </p>
            <button
              className="btn btn-primary btn-sm"
              type="submit"
              disabled={state.kind === "loading"}
            >
              <SignIn size={17} weight="bold" />
              {state.kind === "loading" ? "Mencari..." : "Cari room"}
            </button>
          </form>

          <div className="room-result" aria-live="polite" aria-busy={state.kind === "loading"}>
            {state.kind === "found" ? (
              <>
                <p className="room-code-big">{state.room.room_code}</p>
                <dl className="room-facts">
                  <div>
                    <dt>Status</dt>
                    <dd>{status?.label ?? state.room.status}</dd>
                  </div>
                  <div>
                    <dt>Game</dt>
                    <dd>{game?.label ?? "Belum dipilih"}</dd>
                  </div>
                  <div>
                    <dt>Dibuat</dt>
                    <dd>{dateFmt.format(new Date(state.room.created_at))}</dd>
                  </div>
                </dl>
                <p className="room-note">
                  <Warning size={16} aria-hidden="true" />
                  Room ditemukan, tapi permainan langsung belum tersedia. Host belum
                  membuka sesi, atau fitur ini masih tahap dua roadmap.
                </p>
              </>
            ) : null}

            {state.kind === "missing" ? (
              <p className="room-note is-missing">
                Kode tidak ditemukan, atau room-nya sudah selesai. Periksa lagi
                kodenya dengan host.
              </p>
            ) : null}

            {state.kind === "error" ? (
              <p className="room-note is-error">
                <Warning size={16} aria-hidden="true" />
                {state.message}
              </p>
            ) : null}
          </div>
        </article>
      </main>
    </div>
  );
}
