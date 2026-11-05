# Full tracks are self-hosted on R2, with a platform link alongside

Anna uploads complete tracks, not previews. They are stored in Cloudflare R2 and played
in the Portfolio's own player. Each Song also carries an optional outbound link to the
same track on a streaming platform.

Recorded for the constraint it depends on, which is not visible anywhere in the code: we
are assuming Anna holds the rights to distribute her own masters. If a label or a
distributor is involved, that assumption fails and the site is hosting audio it may not
be allowed to host. This needs written confirmation from Anna before launch.

Previews were the safe alternative and were rejected: a recruiter who has to click
through to Spotify to hear the rest does not click. At roughly ten tracks the R2 egress
is negligible, so bandwidth was not the deciding factor.

## Amended 2026-11-05: a Song may carry no audio when its video carries the sound

Anna asked to skip the audio file on works whose video is already on YouTube: her short
film and her logo sound design. The file was the same sound a second time, it took space
on the bucket, and it put a record on works that are not records.

So the audio is optional when a video link the site can embed is given, and only then:
`src/lib/song-sound.ts` refuses a Song with neither, in both languages, and asks for the
running time only beside an audio file. A Song without audio has no transport and no
record; its cover becomes the video's screen (ADR-0014). Everything above still holds for
the Songs that do carry audio, which remain self-hosted in full.

The two columns become nullable through the one kind of column change ADR-0011 allows a
deploy to run, relaxing a NOT NULL.
