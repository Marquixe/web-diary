import {
  parseISO,
  differenceInHours,
  differenceInCalendarDays,
  getDay,
  addDays,
} from 'date-fns'
import type { ScheduleRule, ChecklistCompletion } from '../types.js'

export interface ScheduleStatus {
  isActive: boolean
  nextAvailableAt: Date | null
  lastCompletedAt: Date | null
}

/**
 * Pure function — no side effects.
 * Given a rule and the completion log for one checklist item, returns its status as of `now`.
 */
export function evaluateSchedule(
  rule: ScheduleRule,
  completions: ChecklistCompletion[],
  now = new Date()
): ScheduleStatus {
  const sorted = [...completions].sort(
    (a, b) => parseISO(b.completedAt).getTime() - parseISO(a.completedAt).getTime()
  )
  const lastDate = sorted[0] ? parseISO(sorted[0].completedAt) : null

  switch (rule.type) {
    case 'daily': {
      const completedToday =
        lastDate !== null && differenceInCalendarDays(now, lastDate) === 0
      return {
        isActive: !completedToday,
        nextAvailableAt: completedToday ? addDays(new Date(now.setHours(0, 0, 0, 0)), 1) : null,
        lastCompletedAt: lastDate,
      }
    }

    case 'weekdays': {
      const todayDow = getDay(now) // 0=Sun
      const isScheduledToday = rule.days.includes(todayDow)
      const completedToday =
        lastDate !== null && differenceInCalendarDays(now, lastDate) === 0
      return {
        isActive: isScheduledToday && !completedToday,
        nextAvailableAt: null,
        lastCompletedAt: lastDate,
      }
    }

    case 'everyNDays': {
      if (!lastDate) return { isActive: true, nextAvailableAt: null, lastCompletedAt: null }
      const daysSince = differenceInCalendarDays(now, lastDate)
      const next = addDays(lastDate, rule.n)
      return {
        isActive: daysSince >= rule.n,
        nextAvailableAt: daysSince < rule.n ? next : null,
        lastCompletedAt: lastDate,
      }
    }

    case 'cooldown': {
      if (!lastDate) return { isActive: true, nextAvailableAt: null, lastCompletedAt: null }
      const hoursSince = differenceInHours(now, lastDate)
      const next = new Date(lastDate.getTime() + rule.hours * 3600 * 1000)
      return {
        isActive: hoursSince >= rule.hours,
        nextAvailableAt: hoursSince < rule.hours ? next : null,
        lastCompletedAt: lastDate,
      }
    }
  }
}
