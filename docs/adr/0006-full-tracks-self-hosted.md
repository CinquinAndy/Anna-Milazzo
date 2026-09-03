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
