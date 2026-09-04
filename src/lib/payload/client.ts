import configPromise from '@payload-config'
import { getPayload } from 'payload'

/** The Local API, for Server Components. No HTTP hop, no REST round trip. */
export const payloadClient = () => getPayload({ config: configPromise })
