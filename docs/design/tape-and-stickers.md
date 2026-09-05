# Tape, from client-supplied references

Fills the gap flagged in `docs/research/folder-ui-and-typography.md` §2, which found no
shipped sites to cite. These are observations from two reference images the client sent,
not from live sites, treat as a build brief to test.

## What the references show

- Tape sits at the **top two corners only**, never all four, never mid-edge.
- Each strip is rotated roughly **40-50°**, and the two strips mirror each other.
- The strip **straddles the boundary**: part of it lies on the photo, part on the paper
  behind it. This overlap is what sells the illusion, a strip contained inside the
  photo's bounds reads as a printed graphic, not as tape.
- Colour is **translucent and desaturated**: cool pastels (pale blue, lavender) and warm
  creams, at roughly 70-85% opacity so the surface underneath shows through.
- Ends are **cut straight**, not torn. Torn ends read as scrapbook craft; straight cuts
  read as studio.
- A **very faint** drop shadow lifts the strip off the surface. Faint, this is the one
  place in the design where a soft shadow is correct, because tape is thin.
- One reference gives the photo a **white print margin** inside its keyline, like a
  darkroom print.

## Build notes

- The strip is a rotated rectangle, so a `<span>` with `rotate()` is enough, no SVG, no
  raster asset. Keep it out of the accessibility tree with `aria-hidden="true"`.
- It must be a sibling that overflows the image container, not a child clipped by it.
- Rotation is **composition, not animation**: set it statically, never animate it.
- Vary the angle per instance (a shared value for every strip reads as a repeated
  component, which is exactly the tell to avoid).
- Tape is the one element allowed to break the hard-offset-shadow rule.
