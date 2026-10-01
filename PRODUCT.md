# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Broad by deliberate choice, not by indecision. Workers, students, teachers, and organizations of every size, in every kind of room. No single persona is primary, which is a hard design constraint rather than an unanswered question: the interface must stay legible and inviting to a nervous first-time teacher, a confident HR facilitator, and a 60-year-old at a family gathering, without dumbing itself down for any of them.

Two distinct roles share the product:

- **The host/facilitator** runs the session. Usually on a laptop, often projecting or screen-sharing, frequently under time pressure in front of a room. They drive everything: the tools, the timer, the sound, the fullscreen presenter view.
- **The participant** mostly holds a phone and does very little. They may join by a short room code. Many have never seen the product before and will never make an account.

## Product Purpose

Let someone break the ice in a room with no setup time and no technical risk. Success is concrete: a facilitator lands, picks an activity, and is running it in under a minute, having installed nothing and logged into nothing.

The product covers both halves of a real session: **live browser tools** to project, and a **catalog of non-digital physical games** (Simon Says, Human Knot, two truths and a lie) that need no gadget at all. That offline half is the part most icebreaker products skip.

## Positioning

Zero friction, in both directions. Nothing to install, no account to create, no lobby to enter — a participant is useful within seconds of opening a link. And it does not assume everyone has a phone: the non-digital catalog is a first-class citizen, not a fallback.

## Operating Context

- A facilitator is usually projecting to a room or sharing a screen in Zoom, sometimes mid-session and under pressure.
- A dedicated **Presenter View** exists for fullscreen, low-distraction projection.
- Participants are frequently on their own phones, joining by a short room code shown on the host's screen.
- The facilitator controls pacing with the timer and drives energy with the sound board.
- Sessions are short by design: 3-5 minutes for a classroom reset, 5-10 for a meeting, longer for workshops.
- All curated content must stay safe for work and school, free of SARA and offensive material.

## Capabilities and Constraints

Built today: spin-the-wheel, question generator, a clue-based riddle game, an interactive timer with sound effects, a click-speed micro game, a multiple-choice quiz, the filterable offline-game catalog, a participant room-code lookup, and an internal admin for catalog, templates, rooms, and users.

- Content is Indonesian, and it stays Indonesian.
- **No emoji anywhere in the product.** Binding, user-mandated. Custom SVG iconography and the existing `LogoMark` carry the brand.
- Page load target under 1.5s; the tool must be ready the moment a facilitator needs it.
- Must hold up both projected at a distance and on a low-end phone in a participant's hand.
- Touch targets are held to at least 44px on touch widths.
- Supabase RLS governs data. A signed-out participant can resolve a room code, and the anon grant is deliberately narrowed so a host's identity can never leak.
- Undecided and not built: participant presence and realtime rooms. There is no players table and no realtime channel, so no surface may imply a shared session exists.

## Brand Commitments

- The name **"IceBreaker Hub" is not binding.** The PRD marks it tentative and the user confirmed both the name and the palette are replaceable in a redesign.
- Indonesian language is binding.
- The no-emoji rule is binding.
- No invented claims, testimonials, customer names, press, or usage numbers may ever appear.

## Evidence on Hand

- `PRD.md`: the original product requirement document, the richest statement of intent.
- The live production site at `https://ice-five-omega.vercel.app`, with real content in the catalog.
- The running application, which is the incumbent visual and interaction evidence.
- **No** testimonials, customer logos, press coverage, usage analytics, or awards exist. Any of these would be fabrication and must not be designed in.

## Product Principles

1. **Zero friction is the product.** Every step a host or participant must perform before the first moment of delight is a defect.
2. **Broad audience, one clear path.** Because no persona is primary, the design earns clarity through hierarchy and legibility rather than through visual cleverness that only some people read.
3. **The room is the real screen.** A facilitator's projector and a participant's phone are both first-class. Legibility at distance and tap comfort up close are the same requirement.
4. **Never fake capability.** The product is far more credible saying plainly what it cannot yet do than implying a shared session it does not have.
5. **Safe content is a feature, not a filter.** Curated for work and school by default.

## Accessibility & Inclusion

- Touch targets at least 44px on touch widths; generous hit areas on anything a facilitator hits mid-session.
- Legible at projector distance, and legible on a small, cheap phone screen.
- Indonesian copy stays plain and direct; the audience includes people who are not confident with software.
- Content is curated safe for work and school.
- No requirement to read fine print, create an account, or hold a physical device to participate.
