/**
 * The torn edge. A thermal receipt does not end in a straight cut: it is torn
 * across the printer's tear bar, so it ends in a shallow zigzag. This is the
 * only decorative geometry in the world and it does structural work - it is
 * what separates one thing that happened from the next.
 *
 * The teeth repeat at a fixed pitch and the viewBox stretches, so the tooth
 * size stays constant no matter how wide the strip gets.
 */

type Props = {
  /** A strip's tail hangs down; a segment just torn off shows its head torn
   *  above it. */
  edge?: "top" | "bottom";
  /** Print a word on the tear, the way a receipt asks you to detach it. */
  label?: string;
};

const VIEW_W = 400;
const PITCH = 14;
const DEPTH = 5;

function teethPath() {
  const teeth = Math.round(VIEW_W / PITCH);
  let d = `M0 ${DEPTH / 2}`;
  for (let i = 0; i < teeth; i++) {
    const x = i * PITCH;
    d += ` L${x + PITCH / 2} ${i % 2 === 0 ? 0 : DEPTH} L${x + PITCH} ${DEPTH / 2}`;
  }
  return d;
}

const PATH = teethPath();

export default function Tear({ edge = "bottom", label }: Props) {
  return (
    <div className={`tear tear-${edge}`}>
      <svg
        className="tear-edge"
        viewBox={`0 0 ${VIEW_W} ${DEPTH}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {/* The counter showing through the teeth. */}
        <path d={`${PATH} L${VIEW_W} ${DEPTH} L0 ${DEPTH} Z`} fill="var(--counter)" />
        <path
          d={PATH}
          fill="none"
          stroke="var(--rule)"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {label ? <span className="tear-label mono">{label}</span> : null}
    </div>
  );
}
