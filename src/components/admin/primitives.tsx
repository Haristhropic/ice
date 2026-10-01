"use client";

import { WarningCircle, CheckCircle, Info } from "@phosphor-icons/react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/* Shared form + display primitives for the /admin surfaces.
   All class names here are defined in the admin block of globals.css and
   use only the project's existing tokens. */

type FieldProps = {
  label: string;
  htmlFor: string;
  help?: string;
  error?: string | null;
  full?: boolean;
  children: ReactNode;
};

export function Field({ label, htmlFor, help, error, full, children }: FieldProps) {
  return (
    <div className={full ? "field full" : "field"}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {help ? <p className="field-help">{help}</p> : null}
      {children}
      {error ? (
        <p className="field-error" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function TextInput({ invalid, className, ...rest }: TextInputProps) {
  return (
    <input
      {...rest}
      aria-invalid={invalid ? true : undefined}
      aria-describedby={invalid && rest.id ? `${rest.id}-error` : rest["aria-describedby"]}
      className={className ? `input ${className}` : "input"}
    />
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function TextArea({ invalid, className, ...rest }: TextAreaProps) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid ? true : undefined}
      aria-describedby={invalid && rest.id ? `${rest.id}-error` : rest["aria-describedby"]}
      className={className ? `textarea ${className}` : "textarea"}
    />
  );
}

export type SelectOption = { value: string; label: string };

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: ReadonlyArray<SelectOption>;
  invalid?: boolean;
};

export function SelectInput({ options, invalid, className, ...rest }: SelectInputProps) {
  return (
    <select
      {...rest}
      aria-invalid={invalid ? true : undefined}
      aria-describedby={invalid && rest.id ? `${rest.id}-error` : rest["aria-describedby"]}
      className={className ? `select ${className}` : "select"}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

type CheckboxProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function Checkbox({ id, checked, onChange, label }: CheckboxProps) {
  return (
    <div className="check-row">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label className="check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}

export type PillTone = "neutral" | "accent" | "sun" | "teal";

export function Pill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export type BannerTone = "error" | "ok" | "info";

const BANNER_ICON = {
  error: WarningCircle,
  ok: CheckCircle,
  info: Info,
} as const;

export function Banner({ tone, children }: { tone: BannerTone; children: ReactNode }) {
  const Icon = BANNER_ICON[tone];
  return (
    <div className={`banner banner-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span className="banner-icon" aria-hidden="true">
        <Icon size={18} weight="fill" />
      </span>
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-body">{body}</p>
      {action}
    </div>
  );
}

export function SkeletonRows({ rows = 4, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-scroll">
      <table className="ltable">
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }, (_, columnIndex) => (
                <td key={columnIndex}>
                  <div
                    className="skeleton"
                    style={{ width: `${45 + ((rowIndex * 7 + columnIndex * 13) % 45)}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type Stat = { label: string; value: number | string };

export function StatStrip({ stats }: { stats: ReadonlyArray<Stat> }) {
  return (
    <div className="totals">
      {stats.map((stat) => (
        <div className="total-row" key={stat.label}>
          <p className="total-num">{stat.value}</p>
          <p className="total-name">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export function PanelHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="sheet-head">
      <div>
        <h2 className="sheet-title">{title}</h2>
        {sub ? <p className="sheet-sub">{sub}</p> : null}
      </div>
      {actions ? <div className="sheet-actions">{actions}</div> : null}
    </div>
  );
}

/* Formats an ISO timestamp for the admin tables. Fixed locale and
   timezone so rows do not shift depending on where the admin is. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())} UTC`;
}
