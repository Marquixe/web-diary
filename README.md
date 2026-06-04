# Personal Life OS — Project Specification (v3)

> **What this document is:** the full development bible for this project. In future chats, reference any part by its ID — e.g. *"we're working on Stage 1.8"* or *"let's revisit the editable window."* Paste or attach this file and I'm caught up.

> **Reframe history.** v1: dashboard-as-home. v2 (current core): the **day** is the spine — home is a month calendar, you tap a day, and the day *contains* diary + feelings + checklist logs; mood folded into the day. v3 (this version): foundational data decisions resolved — day as composition of timestamped parts, block-based diary document (TipTap), log-counters-from-day, rolling editable window, device-local time.

---

## 1. Project Vision

A self-hosted personal web app — a **Personal Life Operating System** — on a VPS, accessed through a VPN, installable as a PWA. Single user (the owner). Day-centric: you live in a month calendar, drop into a day, and everything about that day is there.

Surfaces:

1. **Month Calendar (home)** — landing; grid of days, each cell summarised by feeling-colors + a diary marker.

2. **Day Page** — the heart; composes diary + feeling tags + that day's checklist logs + events logged that day.

3. **Diary** — block-based writing canvas inside the day (text, color, timestamp, photos, counter-event blocks).

4. **Feeling tags** — selectable feelings attached to a day (replaces the old mood module).

5. **Checklists** — repeatable items, split into *definition* and *instance*; daily or general.

6. **To-dos** — one-time tasks (distinct from checklists); feed the Priorities matrix.

7. **Counters** — good/bad tracking; count + time-since + month timeline; loggable from the day; monthly stat window.

8. **Priorities (Eisenhower matrix)** — to-dos by urgency × importance, drag between quadrants.

9. **Google Calendar sync** — bidirectional sync for to-dos.

10. **Calories** — editable food list, calorie *ranges*, daily limit, monthly stat window.

11. **Money** — spending log + subscriptions; monthly stat window.

12. **Stats page** — today's pulse + general aggregates (NOT the home screen).

---

## 2. Core Architecture Philosophy

**Day-centric, composed from parts.** A `Day` is NOT one big object. It is a thin anchor (a date) plus parts that each carry a date/timestamp. The Day Page queries *everything where date = X* and composes the view. This means each module owns its own data, new "parts of a day" can be added later without touching a monolith, and timestamped events (counter logs, calorie/money entries) automatically belong to a day.

Concretely:

- A thin **`day` row** (date as key) holds only what exists *exclusively* per day: the **diary document** and the **feeling tags**.

- Everything else lives in its **own timestamped tables** — checklist completions, counter events, calorie entries, money entries — and is **joined into the Day Page** by date.

**Diary = structured block document, not an HTML/text string.** Stored as a block array (TipTap / ProseMirror JSON): `text` (with color marks), `timestamp`, `photo`, and custom blocks like `counter-event` and (future) `checklist`. This supports photos now, is extensible later (no video planned), and the editor manages the caret natively — so an inserted `[17:49]` always lands at the blinking cursor, never at the start.

**Log-from-day (unification).** A button in the diary inserts a `counter-event` block (e.g. "🏋 Gym session · 18:30") that simultaneously (a) adds the block to the day's document and (b) writes a real counter event with that timestamp. One action, both sides. Because events carry full timestamps, the same mechanism enables **backfill**: add an event on a chosen past date/time (time picker extended with a day selector).

**Time = device-local.** Store everything in UTC; compute month boundaries and display using the **device's local timezone**, so VPS and phone always agree.

### Two distinct windows (don't conflate them)

- **Stat window = calendar month.** Counters, calories, money show the *current month* live; previous months are archived for viewing. Events are **never deleted** — "reset" is purely a view filter, so any month can be recomputed and corrected.

- **Editable window = rolling ~30+ days (configurable).** Days within the window are editable; older days **freeze to read-only**. This solves the cross-month edge case (remembering on the 1st that you wanted to add to "yesterday"), since yesterday is still inside the rolling window.

### Reusable primitives (build once, reuse everywhere)

- **Schedule rules engine** — checklist definition + completion log → `{ isActive, nextAvailableAt, lastCompletedAt }`. Pure logic.

- **Monthly stat-window engine** — shared by counters, calories, money. Filters live view to the current calendar month and exposes archived months; never destroys data.

- **Editable-window guard** — given a date, returns whether it's still editable (within the rolling N days) or frozen.

- **Per-item color tokens** — counters (and feelings) get a unique color, reused in timelines and calendar dots.

- **Day composition** — assembles diary + feelings + checklist instances + timestamped events for a date.

- **Base card/entry components.**

**Type-flow principle.** Drizzle infers types from schema → Zod validates/refines → shared package exports → React Query delivers, fully typed.

---

## 3. Tech Stack

### Frontend

| Concern | Choice | Why |

|---|---|---|

| Framework | **React + Vite** | Fast, LLM-friendly |

| Language | **TypeScript** everywhere | Saves hours; better LLM output |

| Styling | **Tailwind CSS** | Style + markup together |

| Components | **shadcn/ui** | Copy-into-project components you own |

| **Diary editor** | **TipTap (ProseMirror)** | Block document: text/color/timestamp/photo + custom blocks; native caret handling |

| Server state | **React Query** | Fetch/cache/refetch |

| Client state | **Zustand** | Current day, user, nav |

| Routing | **React Router v6** | Standard |

| Charts | **Recharts** | Counter timelines, trends |

| Dates | **date-fns** (+ tz) | Calendar math, device-local boundaries |

| Drag & drop | **dnd-kit** | Matrix quadrant dragging |

### Backend

**Hono** (Node.js) · **Drizzle** ORM · **PostgreSQL** (JSON columns for the diary block document) · **Zod** (shared validation/types).

### Infrastructure

**Docker Compose** (app + Postgres + Nginx + Redis) · **Nginx** reverse proxy · **Let's Encrypt/Certbot** · **Redis** from day one.

### Dev Experience

**pnpm workspaces** · **ESLint + Prettier** · **Cursor/Windsurf** · **Git, committed often**.

### Mobile (PWA)

**vite-plugin-pwa** — installable, offline-first (UI from cache, writes queue + sync). Add to Home Screen, push (Android native; iOS 16.4+ once installed). iOS PWA via Safari engine only; **Capacitor** is the escape hatch if true-native is ever needed.

### Explicitly skipped

Next.js · GraphQL · Redux · Prisma · microservices · video in diary.

### Future / optional

tRPC · Lucia/Better Auth · Resend/Nodemailer · **BullMQ** (scheduled jobs — good fit for the nightly editable-window freeze + month rollover) · Playwright/Cypress.

---

## 4. Monorepo Structure

```

/apps

  /web        ← React frontend

  /api        ← Hono backend

/packages

  /shared     ← Types, Zod schemas, the engines (schedule, stat-window, editable-guard), utilities

```

The `shared` package holds `Day`, `Task`, the diary-block types, schedule + stat-window + editable-guard engines, and Zod validators. Both `web` and `api` import it.

---

## 5. Learning Notes

Curve: Tailwind+shadcn (a day or two) · React Query+Zustand (one use) · Drizzle+Zod (a few hours) · Hono (an afternoon) · TipTap (read the docs — block schema + custom nodes is the part that matters) · Docker (most patience). **Read Drizzle first** (schema + migrations) and skim **TipTap's custom-node guide** before Stage 1.8.

---

## 6. Development Stages — Master Index

| Stage | Theme | Est. (LLM-assisted) |

|---|---|---|

| **1** | Foundation · Calendar · Day Page · Diary · Feelings | ~2–2.5 weeks |

| **2** | Checklists & To-dos | ~1.5 weeks |

| **3** | Counters & Priorities (+ stat-window engine) | ~1.5 weeks |

| **4** | Google Calendar Sync | ~1.5 weeks |

| **5** | Calories | ~1 week |

| **6** | Money | ~1 week |

| **7** | Stats Page · Polish · PWA hardening | ~2 weeks |

**Total:** ~11–12 weeks casual, 7–8 pushing. Real time lives in decisions: schema/day-composition, the diary block schema, the three engines, Calendar OAuth.

Within a stage, work top-to-bottom. Exception: **1.5 (component library)** grows across all stages.

---

## 7. Stages — Detailed Pieces

### Stage 1 — Foundation · Calendar · Day Page · Diary · Feelings

- **1.1 — Scaffolding.** Monorepo (web/api/shared), React + backend + PostgreSQL, env, "hello world" on the VPS through the VPN, Nginx + HTTPS.

- **1.2 — Auth.** Single hardcoded user, JWT, login, protected routes, backend guard, refresh cookie.

- **1.3 — Database Schema (core).** `users`; thin **`day`** table (date PK, `diary` JSON block-document, `feelings` tag array); `tags`/`feelings` master; and the **timestamped event tables** that join into a day (checklist completions, counter events; calorie/money come later). Store UTC; add a derived/guarded `editable` check based on the rolling window. Diary lives as a JSON column.

- **1.4 — App Shell & Nav + PWA + Design Tokens.** Bottom nav (mobile) / sidebar (desktop), routing, layout, light/dark, tokens. Wire vite-plugin-pwa.

- **1.5 — Base Component Library.** `Card`, `Button`, `Input`, `Modal`, `Badge`, `DateLabel`, `DayCell`. Continuously expanded.

- **1.6 — Month Calendar (Home).** 7-per-row, Monday-first, device-local. Each `DayCell`: feeling-color dots + diary marker. Tap → Day Page; future days locked; "Today" shortcut. Month nav.

- **1.7 — Day Page (composition container).** Queries everything for date X and stacks it: feelings, diary, checklist logs, events. Respects the editable-window guard (frozen days render read-only). The frame every module plugs into.

- **1.8 — Diary editor (TipTap).** Block document. Toolbar: **timestamp insert** (time picker defaulting to now, nudgeable to the past; inserts a `timestamp` block **at the caret**), **text color**, **photo**, and a **counter-event block** button (log-from-day → also writes a real counter event). Caret handled by the editor. Auto-save the block JSON.

- **1.9 — Feeling tags.** Select 0..many per day; editable master list (add/remove, auto color). Drives the `DayCell` dots.

### Stage 2 — Checklists & To-dos

- **2.1 — Data model.** Checklist **definition** (name, daily/general, schedule) separate from **instances/completion log**. **To-do** is a distinct one-time type that feeds Priorities. Sketch first.

- **2.2 — Schedule rules engine.** Pure function (examples: cooldown / weekdays / everyNDays). Isolated; test manually.

- **2.3 — Checklist definition CRUD (settings).** Name, daily vs general, schedule config.

- **2.4 — Checklist instances in the Day Page.** Active items surface as **logs** (succeeded / missed) for that date; ticking logs a completion.

- **2.5 — Daily vs general management views.**

- **2.6 — To-dos.** One-time tasks; the only input to the Priorities matrix.

- **2.7 — Completion history & streaks (optional).** Heatmap/dots over the log.

### Stage 3 — Counters & Priorities

- **3.1 — Counter data model.** Name, direction, unit, **color**, event log of `{ timestamp, delta }`. Full timestamps → events belong to a day and support **backfill**. Support **+ and −**.

- **3.2 — Monthly stat-window engine (shared primitive).** Live view = current calendar month; previous months archived; nothing deleted (so past months stay correctable). Reused by Calories and Money.

- **3.3 — Counter card.** Count (this month), **"…ago"**, **+ / −**, optional note. Backfill action (date + time picker) for missed days.

- **3.4 — Counter month timeline (mobile-first).** Per-day marks in the counter's color. **No hover-only tooltips:** show numbers in cells or **tap-to-reveal** ("the 14th: 1"), plus an optional **list view** of recent events (often more readable on phone). Today outlined; scrollable across months is future.

- **3.5 — Eisenhower matrix data model.** To-dos only: `isUrgent`, `isImportant`, status, optional due date, optional sync flag. Quadrants are derived views.

- **3.6 — Matrix drag-and-drop (dnd-kit).** Drag cards between quadrants; drop updates the booleans.

- **3.7 — Matrix alt view (optional).** Flat list; XY placement later.

### Stage 4 — Google Calendar Sync

OAuth2 first, then bidirectional. To-dos with a due date push to a "Life OS" calendar; events pull back. Poll ~15 min. Sync to-dos (and maybe checklist check-ins as all-day events) only — not diary/feelings/calories. Keep the **"To-dos that would sync"** preview.

### Stage 5 — Calories

- **5.1 — Editable food list (settings).** Add/edit/delete; each food stores a **calorie range** (min–max).

- **5.2 — Daily log + range totals.** Search-and-add; day total shown as a range; saved regulars.

- **5.3 — Limits & coloring.** Daily limit/target; optional color by calorie load (keep only if it helps).

- **5.4 — Monthly stat window.** Reuse 3.2; past months correctable.

### Stage 6 — Money

- **6.1 — Transactions.** Name, amount, category, date.

- **6.2 — Subscriptions.** Name, amount, cycle, next payment.

- **6.3 — Analysis.** Committed vs variable vs target → "how much should I make". Monthly chart.

- **6.4 — Monthly stat window.** Reuse 3.2.

### Stage 7 — Stats Page · Polish · PWA hardening

- **7.1 — Stats page.** Today's pulse (active checklists, day's feelings, counters, calories, spend) + general aggregates (streaks, archived months). Composes existing cards. Not the home screen.

- **7.2 — Charts & trends (Recharts).**

- **7.3 — Polish.** Responsiveness, dark mode, JSON export/backup, offline-first hardening, the nightly editable-window freeze job (BullMQ).

---

## 8. Quick Reference — How to Resume

Say e.g. *"Life OS, Stage 1.3 — let's design the schema"* or *"build the diary block editor (1.8)"* and attach this file.

---

## 9. Resolved Foundational Decisions

1. **Day = composition of timestamped parts**, not a monolith. Thin `day` row (diary doc + feelings) + separate timestamped tables joined on the Day Page.

2. **Diary = TipTap block document** (text/color/timestamp/photo + custom counter-event block). Photos yes, video no. Editor handles caret → inserts land at the cursor.

3. **Log-from-day** unifies diary + counters: a diary block both records itself and creates a real counter event; backfill via date+time picker.

4. **Two windows:** stat window = calendar month (live + archived, never deleted, always correctable); editable window = rolling ~30+ days (configurable), older days freeze read-only.

5. **Time = device-local** for boundaries/display; UTC underneath.

6. **Checklist definition vs instance**, and **checklists vs to-dos**, as specified in Stage 2.1.

### Still genuinely open (decide when reached)

- Diary rich content beyond text/color/photo (deferred).

- Matrix XY view (optional).

- Calorie load color-coding (try, keep if useful).

- Exact rolling-window length default (30? configurable) — confirm during 1.3.