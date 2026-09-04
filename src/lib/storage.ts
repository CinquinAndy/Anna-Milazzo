import { s3Storage } from '@payloadcms/storage-s3'

/** Collections whose files live in the bucket, and the folder each one writes into. */
const PREFIXES = {
	media: 'media',
	audio: 'audio',
} as const

/**
 * The public URL of an uploaded file.
 *
 * Bytes are served from the custom domain in front of the bucket, never proxied through
 * Next: R2 egress is free and supports `Range`, and the app must not be the bandwidth
 * bottleneck for a page whose whole point is playing audio (ADR-0006).
 *
 * The collection's own prefix is the fallback. The stored `prefix` field is not present
 * on every write — an update that does not carry it, or a read with a `select` that omits
 * it, would otherwise rewrite the URL without its folder segment and 404 the file.
 */
function publicFileURL(filename: string, prefix: string | undefined, fallback: string): string {
	const base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
	return `${base}/${prefix || fallback}/${filename}`
}

/**
 * Cloudflare R2 through the S3 API. Every option below is an R2 constraint, not a
 * preference — see the storage section of the spec.
 */
export const r2Storage = s3Storage({
	collections: {
		media: {
			prefix: PREFIXES.media,
			generateFileURL: ({ filename, prefix }) => publicFileURL(filename, prefix, PREFIXES.media),
			// Takes Payload's static file handler off the route, so nothing can quietly
			// start serving bytes through the app again. It also makes the objects public
			// to anyone holding the URL, which is the right trade for a public Portfolio.
			disablePayloadAccessControl: true,
		},
		audio: {
			prefix: PREFIXES.audio,
			generateFileURL: ({ filename, prefix }) => publicFileURL(filename, prefix, PREFIXES.audio),
			disablePayloadAccessControl: true,
		},
	},
	bucket: process.env.S3_BUCKET ?? '',
	config: {
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
		},
		endpoint: process.env.S3_ENDPOINT ?? '',
		// R2 has one region and it is called `auto`.
		region: process.env.S3_REGION ?? 'auto',
		forcePathStyle: true,
		// From v3.729.0 the AWS SDK sends CRC-32 full-object checksums by default, which
		// R2 does not implement — every upload fails until these are turned down.
		requestChecksumCalculation: 'WHEN_REQUIRED',
		responseChecksumValidation: 'WHEN_REQUIRED',
	},
	// No `acl`: R2 rejects the x-amz-acl header outright.
})
