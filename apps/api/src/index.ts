import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

const port = Number(process.env.PORT ?? 3001)
console.log(`API listening on :${port}`)
serve({ fetch: app.fetch, port })

export default app
