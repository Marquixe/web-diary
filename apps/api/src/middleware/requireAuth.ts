import type { Context, Next } from 'hono'
import { verifyToken } from '../auth.js'

export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload = await verifyToken(token)
    c.set('jwtPayload', payload)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}
