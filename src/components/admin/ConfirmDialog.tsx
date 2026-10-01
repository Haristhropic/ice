"use client";

import { Modal } from "./Modal";
import { Banner } from "./primitives";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel: string;
  busy: boolean;
  error?: string | null;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  busy,
  error,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="pkey pkey-quiet pkey-sm" onClick={onClose} disabled={busy}>
            Batal
          </button>
          <button
            type="button"
            className="pkey pkey-danger pkey-sm"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Menghapus..." : confirmLabel}
          </button>
        </>
      }
    >
      {error ? <Banner tone="error">{error}</Banner> : null}
      <p className="sheet-sub">{body}</p>
    </Modal>
  );
}
