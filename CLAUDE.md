# CLAUDE.md — Keeping it Clean

## Project Overview

**"Keeping it Clean"** is a single-page web app for managing household cleaning tasks and DIY eco-friendly cleaning recipes. Built for a household of **4 people + 2 cats + 4 bedrooms + 4 bathrooms**. The app is deployed to **GitHub Pages** via a CI/CD workflow on every push to `master`.

## Tech Stack

- **Vanilla HTML/CSS/JS** — no framework, no build step, no package manager
- **localStorage** for all persistence (keys prefixed with `kic_`)
- **GitHub Pages** for hosting (`.github/workflows/pages.yml`)
- Designed as a **mobile-first PWA-style** cleaning companion
- **PWA-ready**: `manifest.json`, `viewport-fit=cover`, `safe-area-inset-top`, dynamic `theme-color` meta tag

## File Structure

```
index.html              — root HTML, loads CSS + 4 JS scripts, role="main" on #app
css/
  main.css              — all styles (~1720 lines), CSS custom properties, dark mode, responsive,
                         .form-error, .empty-state dark overrides, safe-area-inset-top padding
  theme.css             — theme variables only (light/dark palettes)
js/
  data-tasks.js         — 56 built-in cleaning tasks (daily→annual) with estimatedTime, frequency, room
  data-recipes.js       — 15 DIY eco-friendly cleaning recipes (Japanese traditional methods) + filter tags
  storage.js            — localStorage wrapper, task state, user tasks, custom recipes, favorites,
                         streak, calendar, achievements, dark mode, sound, export/import,
                         active timer persistence, quota exceeded handling, version migration
  app.js                — main application logic (~1036 lines), IIFE-closed, rendering, all interactive features
.github/
  workflows/pages.yml   — GitHub Actions: deploy to GitHub Pages on push to master
.vscode/
  extensions.json       — recommends saoudrizwan.claude-dev
manifest.json           — PWA manifest for installability
```

## Features

### Task Management (Checklist Tab)
- **56 predefined tasks** across 6 frequencies: daily (10), weekly (11), bi-weekly (8), monthly (8), quarterly (6), annual (6)
- **Room filtering**: All, Kitchen, Bathroom, Bedroom, Living, General, Pet
- **Frequency filtering**: show/hide task groups by frequency
- **User-defined tasks**: add, edit, delete custom tasks with name, emoji icon, note, frequency, room
- **Task timer**: per-task stopwatch with elapsed time tracking, persisted across page reloads, sticky timer bar visible on all tabs
- **Estimated time**: each task shows estimated minutes; groups show total estimated time
- **Recipe recommendations**: each task group links to a relevant cleaning recipe
- **Auto-reset by frequency**: daily tasks reset at midnight; weekly/biweekly/monthly tasks reset when their interval elapses
- **Completion progress bar**: shows percentage of completed tasks for current filter view

### Streak & Gamification
- **Streak counter**: tracks consecutive days with completed tasks, with current/best streak display
- **Mini calendar (completion history)**: shows last 30 days with color-coded completion percentage circles
- **12 achievement badges**: milestones for streaks (3/7/30/100 days), tasks completed (10/50/200/500), timer usage (60/300 min), recipe favorites (5), custom recipes (3)

### Recipes Tab
- **15 built-in recipes**: traditional Japanese eco-friendly cleaning methods (rice water, vinegar wiping, tea leaves, charcoal, citrus peel, baking soda, etc.)
- **Search**: filter recipes by name, tags, or Japanese name
- **Tag filtering**: Multi-Purpose, Cat-Safe, Kitchen, Bathroom, Floors, Deodorizer, Glass, Scrub
- **Custom recipes**: add user-defined recipes with name, Japanese name, emoji, ingredients, steps, notes, tags
- **Favorites**: heart button to bookmark favorite recipes
- **Expandable cards**: accordion-style recipe detail view

### Settings & Preferences
- **Dark mode**: follows system preference via CSS `prefers-color-scheme` media queries; dynamic `theme-color` meta updates on scheme change
- **Sound effects**: optional completion sound (Web Audio API, no external assets)
- **Data export/import**: full JSON backup and restore with version migration framework (`EXPORT_VERSION = 2`)
- **Toast notifications**: non-intrusive feedback for user actions, race-condition-safe

## Conventions

- **No build tool** — edit files directly, refresh browser to see changes
- **IIFE pattern** in `app.js` — all state enclosed in a closure to avoid global scope pollution
- **CSS custom properties** for all colors, spacing, and theming
- **localStorage keys** always prefixed with `kic_` to avoid collisions
- **Task IDs** are string identifiers (`daily_1`, `weekly_3`, etc.); user tasks use `user_` + timestamp + random suffix
- **Recipe IDs** are string identifiers (`recipe_1`, `recipe_2`, etc.); custom recipes use `custom_` + timestamp + random suffix
- **Dates** stored as `YYYY-MM-DD` strings in local time
- **Icons** are inline SVG functions (no icon library) — keep them consistent with existing style
- **Responsive breakpoints**: mobile-first, with media queries at 600px and 768px
- **Rendering** uses `DocumentFragment` + `requestAnimationFrame` (not `innerHTML = ''`)
- **No native `confirm()` or `alert()`** — use `showConfirm()` (custom modal) and inline `.form-error` elements
- **Accessibility**: ARIA `role`, `aria-selected`, `aria-controls`, `aria-checked`, `aria-label`, `aria-live` throughout

## Key State (localStorage)

| Key | Type | Description |
|-----|------|-------------|
| `kic_tasks` | Object | Task completion state `{ taskId: { completed, lastCompleted } }` |
| `kic_user-tasks` | Array | User-added custom tasks |
| `kic_custom-recipes` | Array | User-added custom recipes |
| `kic_favorites` | Array | Favorite recipe IDs |
| `kic_streak` | Object | `{ current, best, lastDate }` |
| `kic_calendar` | Object | `{ date: { completed, total, pct } }` |
| `kic_achievements` | Array | Unlocked achievement IDs |
| `kic_dark-mode` | String | `'light'`, `'dark'`, or `'auto'` |
| `kic_sound` | Boolean | Sound effects enabled |
| `kic_last-visit` | String | Last visited date for daily reset |
| `kic_active-timer` | Object | Currently running timer `{ taskId, startTime, elapsed, lastTick }` |

## Implementation Notes

- `updateStreak()` in `storage.js` uses a DST-safe yesterday calculation (commit `ec648ce`)
- No duplicate function declarations — resolved in commit `c0e3a4e`
- Timer interval is paused/resumed via Page Visibility API (`visibilitychange` event)
- Stale timers (>24h old) are discarded on page load
- All data operations in `storage.js` have try/catch for corrupted localStorage
- `_set()` dispatches `storage-quota-exceeded` custom event on `QuotaExceededError`
- `exportAllData()` / `importAllData()` support versioned backup/restore (`EXPORT_VERSION = 2`, `migrateImport()` for future schema changes)
- `showConfirm()` returns a Promise — use `await showConfirm(...)` for destructive actions
- Scroll position is saved/restored per-tab on tab switch (in-memory `scrollPositions` object)
- `render()` batches DOM updates via `requestAnimationFrame` + `DocumentFragment`
- `toastTimer` is tracked and cleared on each `showToast()` call to prevent race conditions
