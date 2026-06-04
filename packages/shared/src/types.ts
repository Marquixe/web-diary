import { z } from 'zod'

// ── Diary block document ──────────────────────────────────────────────────────

export const TextMarkSchema = z.object({
  type: z.literal('mark'),
  attrs: z.object({ color: z.string().optional() }),
})

export const DiaryBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), content: z.string() }),
  z.object({ type: z.literal('timestamp'), attrs: z.object({ time: z.string() }) }),
  z.object({
    type: z.literal('photo'),
    attrs: z.object({ url: z.string(), caption: z.string().optional() }),
  }),
  z.object({
    type: z.literal('counter-event'),
    attrs: z.object({
      counterId: z.string(),
      counterName: z.string(),
      delta: z.number(),
      time: z.string(),
      note: z.string().optional(),
    }),
  }),
])

export type DiaryBlock = z.infer<typeof DiaryBlockSchema>
export type DiaryDocument = { blocks: DiaryBlock[] }

// ── Day ───────────────────────────────────────────────────────────────────────

export const DaySchema = z.object({
  date: z.string(), // YYYY-MM-DD
  diary: z.object({ blocks: z.array(DiaryBlockSchema) }).nullable(),
  feelingIds: z.array(z.string()),
})

export type Day = z.infer<typeof DaySchema>

// ── Feeling ───────────────────────────────────────────────────────────────────

export const FeelingSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(), // hex or tailwind token
})

export type Feeling = z.infer<typeof FeelingSchema>

// ── Counter ───────────────────────────────────────────────────────────────────

export const CounterSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string().optional(),
  color: z.string(),
  direction: z.enum(['up', 'down']),
})

export type Counter = z.infer<typeof CounterSchema>

export const CounterEventSchema = z.object({
  id: z.string(),
  counterId: z.string(),
  delta: z.number(),
  timestamp: z.string(), // ISO 8601 UTC
  note: z.string().optional(),
})

export type CounterEvent = z.infer<typeof CounterEventSchema>

// ── Checklist ─────────────────────────────────────────────────────────────────

export const ScheduleRuleSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('daily') }),
  z.object({ type: z.literal('weekdays'), days: z.array(z.number().min(0).max(6)) }),
  z.object({ type: z.literal('everyNDays'), n: z.number().min(1) }),
  z.object({ type: z.literal('cooldown'), hours: z.number().min(1) }),
])

export type ScheduleRule = z.infer<typeof ScheduleRuleSchema>

export const ChecklistDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['daily', 'general']),
  schedule: ScheduleRuleSchema,
})

export type ChecklistDefinition = z.infer<typeof ChecklistDefinitionSchema>

export const ChecklistCompletionSchema = z.object({
  id: z.string(),
  definitionId: z.string(),
  completedAt: z.string(), // ISO 8601 UTC
})

export type ChecklistCompletion = z.infer<typeof ChecklistCompletionSchema>

// ── To-do ─────────────────────────────────────────────────────────────────────

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  isUrgent: z.boolean(),
  isImportant: z.boolean(),
  status: z.enum(['open', 'done', 'cancelled']),
  dueDate: z.string().nullable(),
  syncToCalendar: z.boolean(),
})

export type Todo = z.infer<typeof TodoSchema>
