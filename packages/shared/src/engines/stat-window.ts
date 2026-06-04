import { parseISO, getMonth, getYear } from 'date-fns'

export interface Timestamped {
  timestamp: string // ISO 8601 UTC
}

export interface MonthKey {
  year: number
  month: number // 0-indexed
}

/** Filter events that fall within the given calendar month. */
export function filterByMonth<T extends Timestamped>(
  events: T[],
  { year, month }: MonthKey
): T[] {
  return events.filter((e) => {
    const d = parseISO(e.timestamp)
    return getYear(d) === year && getMonth(d) === month
  })
}

/** Return the current month key based on device-local time. */
export function currentMonthKey(): MonthKey {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() }
}

/** List all distinct months present in the events, sorted newest-first. */
export function availableMonths<T extends Timestamped>(events: T[]): MonthKey[] {
  const seen = new Map<string, MonthKey>()
  for (const e of events) {
    const d = parseISO(e.timestamp)
    const key = `${getYear(d)}-${getMonth(d)}`
    if (!seen.has(key)) seen.set(key, { year: getYear(d), month: getMonth(d) })
  }
  return [...seen.values()].sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month
  )
}
