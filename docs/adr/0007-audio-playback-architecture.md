# One shared audio element, a decorative bar, and nothing that plays by itself

The landing page holds a single `<audio preload="none">` element at layout level. Folders
do not own an element; they ask the shared one to play a Song. Progress is drawn as
chunky decorative blocks, not a real waveform. Nothing auto-advances when a track ends,
and there is no volume control.

Recorded because each part looks like a limitation and each is deliberate:

- **One element, not twelve.** Apple documents iOS as allowing a single audio stream at a
  time, and twelve elements at `preload="metadata"` fire twelve network requests before
  any interaction. Sharing one element makes "only one plays at once" structural rather
  than something to coordinate.
- **No real waveform.** Precomputed peaks via `bbc/audiowaveform` would work, but it puts
  a binary in the Docker image and ffmpeg in an upload hook — and a true waveform renders
  thin and grey, which is exactly what this visual language rejects. wavesurfer.js without
  supplied peaks downloads and decodes each file in full: roughly 70 MB across a dozen
  tracks. The component interface is shaped so real peaks can replace the decoration later.
- **No auto-advance.** A portfolio is not a radio; audio starting unbidden on a page
  someone is reading is a bad surprise.
- **No volume slider.** On iOS `volume` is not settable from JavaScript and always reads
  back as 1, so the control would be a lie on mobile. Mute works and is enough.
