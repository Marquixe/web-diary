import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { users } from './schema.js'
import { sql } from 'drizzle-orm'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

const username = process.env.OWNER_USERNAME ?? 'admin'
const password = process.env.OWNER_PASSWORD ?? 'changeme'
const hash = await bcrypt.hash(password, 10)

await db
  .insert(users)
  .values({ id: 'owner', username, passwordHash: hash })
  .onConflictDoUpdate({
    target: users.id,
    set: { username, passwordHash: hash },
  })

console.log(`Owner user '${username}' seeded.`)

// Seed default feelings
const { feelings } = await import('./schema.js')
const defaultFeelings = [
  { id: 'f-happy',   label: 'Happy',    color: '#facc15' },
  { id: 'f-calm',    label: 'Calm',     color: '#34d399' },
  { id: 'f-anxious', label: 'Anxious',  color: '#fb923c' },
  { id: 'f-sad',     label: 'Sad',      color: '#60a5fa' },
  { id: 'f-angry',   label: 'Angry',    color: '#f87171' },
  { id: 'f-tired',   label: 'Tired',    color: '#a78bfa' },
  { id: 'f-excited', label: 'Excited',  color: '#f472b6' },
  { id: 'f-focused', label: 'Focused',  color: '#2dd4bf' },
]

for (const feeling of defaultFeelings) {
  await db
    .insert(feelings)
    .values({ ...feeling, userId: 'owner' })
    .onConflictDoNothing()
}

console.log('Default feelings seeded.')
await pool.end()
