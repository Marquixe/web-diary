import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken, verifyToken } from '../auth.js'

// Single hardcoded user — change password via OWNER_PASSWORD env var
const OWNER_ID = 'owner'
const OWNER_USERNAME = process.env.OWNER_USERNAME ?? 'admin'
// Pre-hash at startup so bcrypt.compare works at login time
const OWNER_PASSWORD_HASH = await bcrypt.hash(
  process.env.OWNER_PASSWORD ?? 'changeme',
  10
)

const router = new Hono()

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

router.post('/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json')

  if (username !== OWNER_USERNAME) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const ok = await bcrypt.compare(password, OWNER_PASSWORD_HASH)
  if (!ok) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const payload = { sub: OWNER_ID, username: OWNER_USERNAME }
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ])

  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return c.json({ accessToken, user: { id: OWNER_ID, username: OWNER_USERNAME } })
})

router.post('/refresh', async (c) => {
  const token = getCookie(c, 'refresh_token')
  if (!token) return c.json({ error: 'No refresh token' }, 401)

  try {
    const payload = await verifyToken(token)
    const accessToken = await signAccessToken({ sub: payload.sub, username: payload.username })
    return c.json({ accessToken })
  } catch {
    return c.json({ error: 'Invalid refresh token' }, 401)
  }
})

router.post('/logout', (c) => {
  deleteCookie(c, 'refresh_token', { path: '/' })
  return c.json({ ok: true })
})

router.get('/me', async (c) => {
  const token = getCookie(c, 'refresh_token')
  if (!token) return c.json({ error: 'Not authenticated' }, 401)
  try {
    const payload = await verifyToken(token)
    return c.json({ user: { id: payload.sub, username: payload.username } })
  } catch {
    return c.json({ error: 'Not authenticated' }, 401)
  }
})

export { router as authRouter }
