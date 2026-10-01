import type { ElementType, ReactNode } from "react";

/**
 * The machine writing. A thermal print head crosses the line in a single pass,
 * so this is a wipe with a brighter edge travelling ahead of it - never a
 * per-character typewriter effect, which would be a costume instead of the
 * mechanism.
 *
 * `token` is the value being printed. Changing it remounts this element, which
 * replays the sweep, so the caller wires it to whatever the machine just
 * produced and the line re-prints by itself.
 */
export default function Print({
  token,
  as: Tag = "div",
  className = "",
  children,
}: {
  token: string | number;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag key={String(token)} className={`print-sweep ${className}`}>
      {children}
    </Tag>
  );
}
