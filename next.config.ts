import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
	experimental: {
		// The default is 10MB, and on overflow Next truncates the body silently, logs a
		// warning and lets the request succeed — which would let Anna upload a corrupt
		// track and believe it worked. Set above the largest expected track, and above
		// Payload's own 50MB limit so the error Anna sees is Payload's, not a truncation.
		proxyClientMaxBodySize: '64mb',
	},
	// Next 16 defaults to Turbopack; the webpack block is only the fallback path.
	webpack: webpackConfig => {
		webpackConfig.resolve.extensionAlias = {
			'.cjs': ['.cts', '.cjs'],
			'.js': ['.ts', '.tsx', '.js', '.jsx'],
			'.mjs': ['.mts', '.mjs'],
		}

		return webpackConfig
	},
	turbopack: {
		root: path.resolve(dirname),
	},
}

// `output: 'standalone'` is deliberately not set — it is a Dockerfile requirement, and the
// deployment shape (most likely Nixpacks on Coolify) has not been decided yet.
export default withPayload(nextConfig, { devBundleServerPackages: false })
