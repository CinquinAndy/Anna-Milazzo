// Loads the same `.env` files `next build` does, which is what the Payload CLI does before
// it runs a script. A module of its own, imported first: the Payload config reads
// `process.env` the moment it is imported.
import { loadEnv } from 'payload/node'

loadEnv()
