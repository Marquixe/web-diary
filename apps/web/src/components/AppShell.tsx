import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const navItems = [
  { to: '/calendar', label: 'Calendar', icon: '📅' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 pb-16 md:pb-0 md:pl-16">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 border-t border-border bg-card md:hidden z-50">
        <ul className="flex">
          {navItems.map((item) => (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-xs',
                  pathname.startsWith(item.to)
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed inset-y-0 left-0 w-16 border-r border-border bg-card flex-col items-center py-4 gap-4 z-50">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            title={item.label}
            className={cn(
              'flex flex-col items-center text-xl p-2 rounded-lg',
              pathname.startsWith(item.to)
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
    </div>
  )
}
