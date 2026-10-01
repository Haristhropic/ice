/**
 * The rubber stamp. The one spot of colour a receipt roll ever gets, and in
 * this country it is tinta biru - the merchant's stamp ink. It is used for the
 * two things the product actually confirms: a room code, and a correct answer.
 *
 * Deliberately not a checkmark or a green tick. An angled, slightly
 * over-inked box is what a stamp looks like, and the rotation is the tell.
 */
export default function Stamp({ children }: { children: React.ReactNode }) {
  return <span className="stamp-mark">{children}</span>;
}
