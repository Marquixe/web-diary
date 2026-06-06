import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { RequireAuth } from '@/components/RequireAuth'
import { CalendarPage } from '@/pages/CalendarPage'
import { DayPage } from '@/pages/DayPage'

export default function App() {
  return (
    <RequireAuth>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/day/:date" element={<DayPage />} />
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </AppShell>
    </RequireAuth>
  )
}
