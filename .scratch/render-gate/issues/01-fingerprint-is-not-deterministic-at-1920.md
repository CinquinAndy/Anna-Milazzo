# 01: The render comparison disagrees with itself at 1920x1080

**What to fix:** `scripts/render-fingerprint.mjs` reports elements as changed when nothing
changed, so the `Did the page change` job cannot be trusted as a gate.

**Status:** resolved

## Why this matters now

For a human's pull request the job is `continue-on-error`, so a false positive is noise.
For `renovate[bot]` it is **not**: `.github/workflows/ci.yml` makes the step fail the run
when `github.actor == 'renovate[bot]'`. A phantom difference therefore blocks every
automerged dependency update, which is the whole mechanism this gate was built to protect.
And a gate that cries wolf is a gate nobody reads, so a real regression would go through.

## The evidence

Two consecutive CI runs on the same branch (`feat/umami-analytics`, pull request #4),
whose net change to the rendered DOM was nil:

| run | result |
|---|---|
| `37625685709` | `Base: 17964 elements. Head: 17964. Changed 1, gone 0, new 0.` |
| `37628221512` | `Base: 17964 elements. Head: 17964. Changed 5, gone 0, new 0.` |

The hashes for `/ 1920x1080 main/SECTION[0]/DIV[3]/DIV[0]` **swapped sides** between the two
runs: `aa154d06648372b4` was the base in the first run and the head in the second,
`79383c0e5f9fd6be` the reverse. A real change cannot do that. It is a coin flip between two
states.

Every one of the five rows is at **1920x1080** and nowhere else, in two clusters:

- `/` and `/en`, `main/SECTION[0]/DIV[3]/DIV[0]` — the hero's `.shell`.
- `/contact`, `main/SECTION[1]/DIV[1]/DIV[1]/DIV[1]/FORM[1]/DIV[7]/DIV[0]` and its two
  nested descendants, all three sharing one hash within a run — the Turnstile widget's
  container chain.

## Cause, as far as it was measured

**The hero shell: `auto` margins.** Probed directly against a local production build at
1920x1080, the four margin properties (`margin-inline-start/end`, `margin-left/right`) are
the *only* ones that vary, and they read either `0px` or `208px` for identical geometry —
`getBoundingClientRect()` reports the same 1440px width and `max-width` the same `1440px`
in both cases. The value is a function of the page's load history, not of chance: a second
navigation **in the same page** reads `208px` where the first read `0px`, and a fresh
browser context reads `0px` every time. Things that do **not** fix it: an extra
`requestAnimationFrame` pair, forcing a layout read before reading computed style, and a
discarded warm-up load in its own context (all three tried and measured).

This element is the only box on the site whose `max-width` (1440px) is narrower than its
container, which is why 1920x1080 is the only viewport where those margins are anything but
zero, and therefore the only viewport where the instability has anything to show.

**The Turnstile container:** not investigated, but three nested elements sharing one hash
and settling differently run to run is the widget's own mounting, not the site's layout.

## Options, none chosen yet

1. **Stop reading `auto` margins.** The script's docstring says it describes "every box the
   site itself draws"; a used margin value the renderer will not report consistently is not
   a description of anything. Dropping the four margin properties when the specified value
   is `auto` loses almost no signal, because a changed margin shows up in the geometry of
   every sibling anyway.
2. **Treat third-party subtrees as out of scope.** The Turnstile container is not a box this
   site draws. Skipping the subtree under the widget's mount point is consistent with what
   the script claims to measure.
3. **Make a reported change explain itself.** This is the one that is needed regardless. The
   fingerprint stores a hash per element, so a reported difference cannot be traced to the
   property that moved — four hours went into the diagnosis above that a stored value would
   have answered in a minute. A second output file carrying the full property set for each
   row, or a `--explain <path>` mode that re-measures only the rows the diff named, would
   turn every future false positive into a two-minute question.

## What must not be done

Widening `TOLERANCE` in `scripts/render-diff.mjs` above `0`. The gate's entire value is that
it reports one element out of 17,964; a tolerance that swallows five would swallow a real
regression of the same size, and the two are indistinguishable from the count alone.

## Comments

Fixed, all three. `scripts/render-fingerprint.mjs`:

- The four margin longhands are no longer recorded. They were redundant with the box, which
  is recorded as `x`, `y`, `width`, `height` on the same row, and they were the only
  properties ever observed to be unstable.
- The walk stops at `[data-turnstile]`, so Cloudflare's widget and the divs it injects are
  out of scope. The `.check-slot` above it is still recorded, which is the box that reserves
  the height and therefore the one the layout depends on.
- Each row now carries two hashes, geometry and style, and `render-diff.mjs` reports every
  changed row as `geometry`, `style` or `both` with a count per kind. That is option 3, and
  it is what makes the next false positive a two-minute question instead of a day.

One real mistake on the way: the first attempt put `UNRELIABLE` and `FOREIGN` at module
scope. `snapshot` is serialised and run inside the page by `page.evaluate`, so it closes
over nothing from the file and the script died on every route. They live inside the function
now, with a comment saying why.

Measured after: 17,874 elements, down from 17,946, the 72 being the Turnstile subtrees
across both contact routes and nine viewports. Two runs of one build: `Changed 0, gone 0,
new 0`.

**The limitation this accepts, stated plainly.** A margin change that moves no box at all is
now invisible to this gate. That needs a margin on a last child whose parent does not size
to its content; in every other case the margin moves either the element or a sibling, and
the rect catches it. Widening `TOLERANCE` was and remains the wrong answer, for the reason
above.

**Still to prove.** Two runs of the *same* build were already clean before this change; the
failure only ever appeared on CI, which builds both sides separately. The real verification
is a CI run on a pull request, and that is what the pull request carrying this is for.
