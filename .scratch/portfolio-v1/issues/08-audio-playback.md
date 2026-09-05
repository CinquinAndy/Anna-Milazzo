# 08: Audio playback

**What to build:** A Recruiter presses play on a Folder and hears the Song without leaving
the page. Pressing play on a second Folder stops the first. Progress is visible, seekable,
and stops at the end.

**Blocked by:** 05, 07

**Status:** resolved

- [x] A single audio element is mounted once at layout level; Folders ask it to play rather than owning one each
- [x] Audio is not preloaded, no network request is made for any track before a Recruiter asks for one
- [x] Playing a Song while another plays stops the first; only ever one plays
- [x] Playback starts synchronously inside the press handler, with nothing awaited before it, so mobile Safari does not block it
- [x] Progress renders as chunky decorative blocks that fill as the Song plays, not as a waveform
- [x] The seek control is a styled native range input, operable by keyboard, and reports its position to assistive technology
- [x] The playhead is written to a CSS custom property rather than to component state
- [x] Running time comes from the duration stored on the Song, so nothing loads to display it
- [x] Reaching the end resets the player; the next Song does not start
- [x] There is no volume control; a mute toggle is acceptable
- [x] The player controller is a separate module with no React or DOM in its interface, unit-tested across play, pause, switching mid-play, seeking and reaching the end
- [x] Playwright covers playing one Song, then a second, and asserting only the second plays

## Comments

Done. `bun run validate` green: 27 Vitest tests on the controller, 50 Playwright tests
across the suite.

**Two real bugs, both found by the tests, both in the source swap.**

1. **An interrupted `play()` rejects with `AbortError`.** Pressing a second Song while the
   first one's `play()` promise is still pending rejects that promise, and the `.catch`
   was reading it as a failure, so the Folder the Recruiter had just pressed dropped
   straight back to stopped. It only happens when they press quickly, which is exactly
   what someone skimming a portfolio does. `AbortError` is now ignored by name.
2. **Assigning `src` can fire `pause`.** The spec's media load algorithm sets `paused` and
   fires the event when the element was playing. Chromium, measured here, fires `abort`
   and `emptied` instead and no `pause` at all, but Safari is the browser this design
   most has to survive, so the guard stays: a `pause` arriving immediately after a
   deliberate swap is swallowed rather than read as the Recruiter stopping playback.

**The controller is the seam the spec asked for.** `src/lib/player/controller.ts` imports
nothing, touches no DOM and returns commands rather than performing them, so every awkward
transition is tested directly instead of through a browser. Its 27 tests name what a
Recruiter does, press play, press it again, start a second Song, drag the bar, reach the
end, not the methods that implement it.

**The end-of-track test asserts the sequence the element really produces.** The HTML spec
fires `pause` before `ended`, always. A test that sent `ended` alone would pass against a
sequence no browser emits; this one sends both, in order.

**Playback starts synchronously inside the press handler.** The reducer runs, the commands
run, `src` is assigned and `play()` is called, all in the same tick, nothing awaited
between them. That is the whole reason the controller returns commands rather than doing
the work itself.

**The playhead is a CSS custom property, written from `requestAnimationFrame`.**
`timeupdate` has no specified frequency and is too coarse for a bar meant to look
continuous, and a React state write per frame would re-render the whole stack sixty times
a second. Progress draws as chunky blocks from a repeating gradient, not a waveform, which
would mean downloading and decoding every track to draw something thin and grey.

**Seek is a real `<input type="range">`.** It commits on the native `change` event, not on
React's `onChange`, which for a range *is* `input`, so binding there would fire a seek on
every pointer move of a drag. Its value follows the playhead imperatively, and never while
it is focused: a slider whose value is rewritten each second announces itself continuously
to a screen reader.

**No volume control.** On iOS `volume` is not settable from script and always reads back as
1, so the slider would be a lie on the device most likely to see it. A test asserts none
exists.

**Verified rather than assumed:** exactly one `<audio>` element on the page at
`preload="none"`, and a network listener confirming no `.mp3` is requested until a control
is pressed.

## Review follow-up

**Pausing discarded the playhead, and the next arrow key seeked backwards.** Nothing
advances `positionSeconds` during playback, deliberately, since a state write per frame
would re-render the whole stack, so a pause recorded position 0. The progress blocks and
the seek thumb both snapped to the start while the audio was actually held six seconds in,
and pressing ArrowRight then committed a seek to one second, losing what had been listened
to. The engine now reads the playhead off the element before any transition. The unit test
that looked like it covered this passed only because it injected an `advanced` event the
adapter never produced.
