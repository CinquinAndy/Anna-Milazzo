# The three faces, as static instances

`next/font` self-hosts these as woff2, which is what a browser wants and what Satori, the
renderer behind `ImageResponse`, cannot read: it takes ttf, otf or woff only. So the OG
card carries its own copies, in the exact instance the site renders.

| File | Family | Instance | Where the site uses it |
|---|---|---|---|
| `bricolage-grotesque-condensed-extrabold.ttf` | Bricolage Grotesque | 96pt Condensed ExtraBold (`opsz` 96, `wdth` 75, `wght` 800) | every display heading, at `font-stretch: 74%` |
| `azeret-mono-medium.ttf` | Azeret Mono | Medium (`wght` 500) | the mono pills and every small uppercase label |
| `instrument-sans-regular.ttf` | Instrument Sans | Regular | body copy |

Pulled from the Google Fonts CSS API, which serves ttf rather than woff2 to an old user
agent, at the axis values the stylesheet asks for. `wdth: 75` and not the stylesheet's 74
because 75 is the bottom of the published axis, so 74 already clamped to it.

Vendored rather than fetched at build time: the site is self-hosted on Coolify and a build
that needs the network to draw its own social card is a build that fails on a bad day.

All three are SIL Open Font License 1.1. `OFL.txt` is the licence itself; the copyright
holders are the families' own authors, named on their Google Fonts pages: Bricolage
Grotesque by Mathieu Triay and contributors, Azeret Mono by Displaay, Instrument Sans by
Rodrigo Fuenzalida and Jordan Egstad.
