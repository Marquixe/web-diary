import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRouter } from './routes/auth.js'
import { requireAuth } from './middleware/requireAuth.js'
import type { JwtPayload } from './auth.js'

type AppVariables = { jwtPayload: JwtPayload }

const app = new Hono<{ Variables: AppVariables }>()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
)

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

app.route('/auth', authRouter)

app.use('/api/*', requireAuth)
app.get('/api/ping', (c) => {
  const payload = c.get('jwtPayload')
  return c.json({ pong: true, user: payload.username })
})

const port = Number(process.env.PORT ?? 3001)
console.log(`API listening on :${port}`)
serve({ fetch: app.fetch, port })

export default app
