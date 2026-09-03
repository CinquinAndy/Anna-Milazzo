# 08: Audio playback

**What to build:** A Recruiter presses play on a Folder and hears the Song without leaving
the page. Pressing play on a second Folder stops the first. Progress is visible, seekable,
and stops at the end.

**Blocked by:** 05, 07

**Status:** ready-for-agent

- [ ] A single audio element is mounted once at layout level; Folders ask it to play rather than owning one each
- [ ] Audio is not preloaded — no network request is made for any track before a Recruiter asks for one
- [ ] Playing a Song while another plays stops the first; only ever one plays
- [ ] Playback starts synchronously inside the press handler, with nothing awaited before it, so mobile Safari does not block it
- [ ] Progress renders as chunky decorative blocks that fill as the Song plays, not as a waveform
- [ ] The seek control is a styled native range input, operable by keyboard, and reports its position to assistive technology
- [ ] The playhead is written to a CSS custom property rather than to component state
- [ ] Running time comes from the duration stored on the Song, so nothing loads to display it
- [ ] Reaching the end resets the player; the next Song does not start
- [ ] There is no volume control; a mute toggle is acceptable
- [ ] The player controller is a separate module with no React or DOM in its interface, unit-tested across play, pause, switching mid-play, seeking and reaching the end
- [ ] Playwright covers playing one Song, then a second, and asserting only the second plays
