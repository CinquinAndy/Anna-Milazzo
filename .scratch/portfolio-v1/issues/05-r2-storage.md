# 05: Media and audio storage on R2

**What to build:** Anna uploads an image or a track in the admin and it lands in object
storage, is served to browsers from the public audio domain, and an oversized file is
rejected with a clear error rather than silently truncated.

**Blocked by:** 04

**Status:** resolved

- [x] Image and audio uploads go to the R2 bucket, not to the container's disk
- [x] The S3 client is configured for R2's constraints: path-style addressing, region `auto`, no ACL header, and checksum calculation only when required
- [x] Uploaded files are served to the browser from the public custom domain in front of the bucket, never proxied through the app
- [x] The audio collection accepts only audio files and rejects other types
- [x] The request body size limit is set explicitly, above the largest expected track — the framework default does not error on overflow, it truncates the body silently
- [x] Uploading a file above the limit produces a visible error in the admin; the resulting record is not saved in a broken state
- [x] A file uploaded through the admin plays end to end when its URL is opened directly, confirming range requests work

## Comments

Done. `bun run validate` green. Migration `20260904_005732_r2_storage` committed and
applied — the plugin injects a `prefix` field into both upload collections, so it is a
schema change, not just configuration.

**The headline finding: `limits.fileSize` on its own does not reject an oversized file,
it truncates it and saves the record.** Measured against the running app: a 60.2 MB track
came back `201 Created` with `filesize: 52428800` — exactly the 50 MB limit. Anna would
have had a corrupt track and a success message. The fix is `abortOnLimit: true`, which
turns the same limit into a `413` carrying `responseOnLimit`; re-tested, the upload is
refused and no record is written. This is the same class of failure the spec warns about
for `proxyClientMaxBodySize`, arriving through a different door — and the door the spec
named turns out not to be open here at all, because the proxy matcher excludes `/api`, so
Payload's uploads are never buffered by Next in the first place. `proxyClientMaxBodySize`
is still set to `64mb`, above Payload's 50 MB, so the limit that fails loudly is always
the one that fires first.

**Verified against the real bucket, not inferred:**

- `GET https://audio.andy-cinquin.fr/audio/<track>.mp3` → `200`, `audio/mpeg`, 210407
  bytes, byte-identical in length to the local fixture.
- `accept-ranges: bytes`, and `Range: bytes=100-199` → `206` with exactly 100 bytes. Seek
  in ticket 08 depends on this.
- `GET /api/audio/file/<track>.mp3` on the app no longer serves bytes. Payload's static
  handler is off the route.
- A PNG posted to the `audio` collection → `400 Invalid MIME type: image/png`.
- Deleting a record deletes its object: the stale upload's URL now returns `404`.

**R2's constraints, each one load-bearing:** `forcePathStyle`, `region: 'auto'`, no `acl`
(R2 rejects `x-amz-acl`), and `requestChecksumCalculation` / `responseChecksumValidation`
set to `WHEN_REQUIRED` — from v3.729.0 the AWS SDK sends CRC-32 full-object checksums by
default and R2 does not implement them. The installed SDK is 3.1126.0, well past that
line.

**`generateFileURL` falls back to the collection's own prefix.** The stored `prefix` field
is not present on every write — an update that does not carry it, or a read with a
`select` that omits it, would rewrite the URL without its folder segment and 404 the file.

**`disablePayloadAccessControl` is a per-collection option, not a top-level one.** It also
means the objects are readable by anyone holding the URL; that is the right trade for a
public Portfolio, but it is a security consequence of the option and not only a routing
one.

**A `seed:reset` script was added**, guarded by `SEED_RESET=yes`. The switch from local
disk to R2 needed it: the upload records survived the change but the files they pointed at
did not, so the collections had to be emptied and re-seeded. The guard exists because
`DATABASE_URL` is shared infrastructure.

**Not done, and worth knowing:** the adapter sets no `Cache-Control` on uploaded objects,
so they inherit the zone default. For a page that streams the same few tracks repeatedly
that is worth revisiting — but it is a Cloudflare-side setting, and deployment is out of
scope here.

## Review follow-up

**The import map was never regenerated after the storage plugin landed**, so every admin
page load logged an error about the missing `S3ClientUploadHandler`. Harmless while
`clientUploads` is unset, but it stops being harmless the moment that is turned on — which
is the standard remedy when a large master exceeds a body limit, i.e. exactly the scenario
this ticket is about. Regenerated.
