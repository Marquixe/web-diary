import {
  pgTable,
  text,
  date,
  jsonb,
  timestamp,
  integer,
  boolean,
  varchar,
} from 'drizzle-orm/pg-core'

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ── Feelings master list ──────────────────────────────────────────────────────

export const feelings = pgTable('feelings', {
  id: text('id').primaryKey(),
  label: varchar('label', { length: 64 }).notNull(),
  color: varchar('color', { length: 32 }).notNull(), // hex
  userId: text('user_id').notNull().references(() => users.id),
})

// ── Day (thin anchor) ─────────────────────────────────────────────────────────
// date is the PK (YYYY-MM-DD in the user's local timezone — stored as text)
// diary is a TipTap/ProseMirror block-document JSON: { blocks: DiaryBlock[] }
// feelingIds is an array of feeling IDs selected for this day

export const days = pgTable('days', {
  date: date('date').primaryKey(), // YYYY-MM-DD
  userId: text('user_id').notNull().references(() => users.id),
  diary: jsonb('diary'),           // DiaryDocument | null
  feelingIds: jsonb('feeling_ids').notNull().default('[]'), // string[]
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ── Counters ──────────────────────────────────────────────────────────────────

export const counters = pgTable('counters', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 128 }).notNull(),
  unit: varchar('unit', { length: 32 }),
  color: varchar('color', { length: 32 }).notNull(),
  direction: varchar('direction', { length: 8 }).notNull().default('up'), // 'up' | 'down'
  sortOrder: integer('sort_order').notNull().default(0),
})

export const counterEvents = pgTable('counter_events', {
  id: text('id').primaryKey(),
  counterId: text('counter_id').notNull().references(() => counters.id),
  delta: integer('delta').notNull(), // +N or -N
  note: text('note'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(), // UTC
})

// ── Checklist definitions + completions ───────────────────────────────────────

export const checklistDefinitions = pgTable('checklist_definitions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 128 }).notNull(),
  kind: varchar('kind', { length: 16 }).notNull(), // 'daily' | 'general'
  schedule: jsonb('schedule').notNull(), // ScheduleRule JSON
  sortOrder: integer('sort_order').notNull().default(0),
  isArchived: boolean('is_archived').notNull().default(false),
})

export const checklistCompletions = pgTable('checklist_completions', {
  id: text('id').primaryKey(),
  definitionId: text('definition_id').notNull().references(() => checklistDefinitions.id),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull(), // UTC
})

// ── To-dos ────────────────────────────────────────────────────────────────────

export const todos = pgTable('todos', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  isUrgent: boolean('is_urgent').notNull().default(false),
  isImportant: boolean('is_important').notNull().default(false),
  status: varchar('status', { length: 16 }).notNull().default('open'), // 'open' | 'done' | 'cancelled'
  dueDate: date('due_date'),
  syncToCalendar: boolean('sync_to_calendar').notNull().default(false),
  googleEventId: text('google_event_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
