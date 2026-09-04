import type { Media } from '@/payload-types'

/**
 * An uploaded image, hard-bordered with an offset shadow.
 *
 * Rendered with a plain `<img>` rather than `next/image` on purpose: the files are served
 * from the public domain in front of the bucket, and routing them back through Next's
 * optimiser would put the app in the path of the very bytes ticket 05 took it out of.
 * Width and height come from the record, so nothing shifts as it loads.
 */
export function Portrait({
	image,
	className,
	priority = false,
	sizes,
}: {
	image: Media | number | null | undefined
	className?: string
	/** The hero portrait. Everything else waits its turn. */
	priority?: boolean
	sizes?: string
}) {
	// `depth` was not deep enough, or the relationship is empty.
	if (image === null || image === undefined || typeof image === 'number') {
		return null
	}

	// next/image is deliberately not used: it routes bytes through /_next/image, putting
	// the app back in the path ticket 05 took it out of. Width and height come from the
	// record, so there is no layout shift to fix either.
	return (
		// biome-ignore lint/performance/noImgElement: see the note above.
		<img
			src={image.url ?? ''}
			alt={image.alt}
			width={image.width ?? undefined}
			height={image.height ?? undefined}
			className={className}
			sizes={sizes}
			loading={priority ? 'eager' : 'lazy'}
			fetchPriority={priority ? 'high' : 'auto'}
			decoding={priority ? 'sync' : 'async'}
		/>
	)
}
