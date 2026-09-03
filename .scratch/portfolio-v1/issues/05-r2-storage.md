# 05: Media and audio storage on R2

**What to build:** Anna uploads an image or a track in the admin and it lands in object
storage, is served to browsers from the public audio domain, and an oversized file is
rejected with a clear error rather than silently truncated.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Image and audio uploads go to the R2 bucket, not to the container's disk
- [ ] The S3 client is configured for R2's constraints: path-style addressing, region `auto`, no ACL header, and checksum calculation only when required
- [ ] Uploaded files are served to the browser from the public custom domain in front of the bucket, never proxied through the app
- [ ] The audio collection accepts only audio files and rejects other types
- [ ] The request body size limit is set explicitly, above the largest expected track — the framework default does not error on overflow, it truncates the body silently
- [ ] Uploading a file above the limit produces a visible error in the admin; the resulting record is not saved in a broken state
- [ ] A file uploaded through the admin plays end to end when its URL is opened directly, confirming range requests work
