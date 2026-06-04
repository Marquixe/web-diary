import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function mondayFirst(dow: number) {
  // getDay returns 0=Sun..6=Sat; convert to 0=Mon..6=Sun
  return (dow + 6) % 7
}

export function CalendarPage() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const today = format(new Date(), 'yyyy-MM-dd')

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const leadingBlanks = mondayFirst(getDay(days[0]))

  return (
    <div className="max-w-lg mx-auto p-4">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="p-2 rounded-lg hover:bg-accent"
        >
          ‹
        </button>
        <h1 className="text-lg font-semibold">{format(month, 'MMMM yyyy')}</h1>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="p-2 rounded-lg hover:bg-accent"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} className="bg-background aspect-square" />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isToday = dateStr === today
          const isFuture = dateStr > today

          return (
            <button
              key={dateStr}
              disabled={isFuture}
              onClick={() => navigate(`/day/${dateStr}`)}
              className={cn(
                'bg-card aspect-square flex flex-col items-center justify-start pt-1.5 text-sm relative',
                isToday && 'ring-1 ring-primary ring-inset',
                isFuture
                  ? 'text-muted-foreground opacity-40 cursor-not-allowed'
                  : 'hover:bg-accent cursor-pointer'
              )}
            >
              <span className={cn('font-medium', isToday && 'text-primary')}>
                {format(day, 'd')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Today shortcut */}
      {format(month, 'yyyy-MM') !== format(new Date(), 'yyyy-MM') && (
        <button
          onClick={() => setMonth(startOfMonth(new Date()))}
          className="mt-4 w-full py-2 rounded-lg border border-border text-sm hover:bg-accent"
        >
          Today
        </button>
      )}
    </div>
  )
}
