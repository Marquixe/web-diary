import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

export function DayPage() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()

  if (!date) return null

  const parsed = parseISO(date)

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => navigate('/calendar')}
        className="text-muted-foreground text-sm mb-4 hover:text-foreground"
      >
        ← Calendar
      </button>
      <h1 className="text-2xl font-semibold mb-1">{format(parsed, 'EEEE')}</h1>
      <p className="text-muted-foreground mb-6">{format(parsed, 'MMMM d, yyyy')}</p>

      <div className="space-y-4 text-muted-foreground text-sm">
        <p>Feelings — coming in Stage 1.9</p>
        <p>Diary — coming in Stage 1.8</p>
        <p>Checklist logs — coming in Stage 2.4</p>
      </div>
    </div>
  )
}
