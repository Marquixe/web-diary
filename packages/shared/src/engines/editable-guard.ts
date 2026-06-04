import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'

/**
 * Returns true if `date` (YYYY-MM-DD) is within the rolling editable window.
 * Future dates are never editable. Default window is 30 days.
 */
export function isEditable(date: string, windowDays = 30): boolean {
  const today = startOfDay(new Date())
  const target = startOfDay(parseISO(date))
  const diff = differenceInCalendarDays(today, target)
  return diff >= 0 && diff <= windowDays
}
