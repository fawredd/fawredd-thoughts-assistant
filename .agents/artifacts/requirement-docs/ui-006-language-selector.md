# [APPROVED] UI-006 — Language Selector (ES / EN) with User Profile Persistence

**Status:** `[APPROVED]`
**Spec Agent:** Spec Agent
**Date:** 2026-04-20

---

## 1. Objective

Allow authenticated users to switch the app UI language between **Spanish (es)** and **English (en)**.
- **Default:** Spanish (`es`) for all users.
- The preference is **persisted** in the user's DB profile so it is restored on next login.
- The **AI Psychologist prompt** is language-aware: it must respond in the language chosen by the user.

---

## 2. Scope

| Area | Details |
|------|---------|
| **Database** | Add `language` column (`text`, default `'es'`) to `users` table |
| **DB Migration** | Drizzle `db push` — add column with default value |
| **Server Action** | New action `updateUserLanguage(language: 'es' \| 'en')` to persist preference |
| **Server Action** | Existing `getOrCreateUser` must return `language` field |
| **AI Prompt** | Psychologist system prompt must include `RESPONSE LANGUAGE` directive |
| **UI — Header** | Language toggle button (ES / EN) in the header bar (both desktop and mobile) |
| **UI — Context** | `LanguageContext` (React Context) provides current language to all client components |
| **UI — Hydration** | Language is seeded from DB on page load (server-side → context initial value) |
| **Strings** | Only key UI strings are translated (header, composer placeholder, empty states, snapshot sidebar labels). No external i18n library required. |

---

## 3. Out of Scope

- Full i18n library (next-intl, i18next, etc.) — NOT required.
- Translating AI-generated content — the AI language directive handles this.
- Translating error messages from Clerk.
- RTL layout changes.

---

## 4. Database Changes

### 4.1 Schema Update — `db/schema.ts`

Add `language` field to the `users` table:

```typescript
language: text('language').default('es').notNull(),
```

### 4.2 Migration

Run `pnpm drizzle-kit push` after updating schema to apply the `ALTER TABLE` to Neon DB.

---

## 5. Server Actions

### 5.1 `getOrCreateUser` — return `language`

`lib/db-utils.ts`: The returned user object must include the `language` field so the layout can seed the context.

### 5.2 New Action — `updateUserLanguage`

**File:** `app/actions/user.ts` (new file)

```typescript
'use server';
export async function updateUserLanguage(language: 'es' | 'en'): Promise<void>
```

- Validates `language` is `'es'` or `'en'`, throws if not.
- Calls `getOrCreateUser()` for auth.
- `db.update(users).set({ language }).where(eq(users.clerkId, clerkUser.id))`.
- Calls `revalidatePath('/')`.

---

## 6. Language Context

**File:** `lib/language-context.tsx` (new file)

```typescript
export type Language = 'es' | 'en';
export const LanguageContext = React.createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
}>({ language: 'es', setLanguage: () => {} });
```

- `LanguageProvider` wraps the app; receives `initialLanguage` prop from server.
- On `setLanguage`, calls `updateUserLanguage(lang)` server action in the background AND updates local state immediately for instant UI feedback.

---

## 7. UI Translations (Inline Dictionary)

**File:** `lib/translations.ts` (new file)

Minimal dictionary covering only the UI strings. Example structure:

```typescript
export const t = {
  es: {
    composer_placeholder: 'Escribe tu pensamiento...',
    composer_submit: 'Publicar',
    feed_empty: 'Aún no tienes entradas.',
    snapshot_title: 'Tu resumen de vida',
    header_logout: 'Cerrar sesión',
    header_profile: 'Perfil',
    header_settings: 'Configuración',
    header_home: 'Inicio',
  },
  en: {
    composer_placeholder: 'Write your thought...',
    composer_submit: 'Post',
    feed_empty: 'No entries yet.',
    snapshot_title: 'Your Life Snapshot',
    header_logout: 'Logout',
    header_profile: 'Profile',
    header_settings: 'Settings',
    header_home: 'Home',
  },
} as const;
```

---

## 8. Language Toggle UI (Header)

### 8.1 Component

**File:** `components/language-toggle.tsx` (new file)

- A simple button/toggle that shows `ES` or `EN` with a globe icon (`Globe` from lucide-react).
- On click: switches language via `setLanguage` from context.
- Visual: active language is highlighted (bold/primary color vs. muted).
- Rendered inside `<Header />` next to `<ThemeToggle />` on both desktop and mobile.

### 8.2 Header Integration

In `components/header.tsx`:
- Import and render `<LanguageToggle />` next to `<ThemeToggle />`.

---

## 9. AI Psychologist Prompt — Language Directive

In `app/actions/journal.ts` — the `system` prompt for the Psychologist must include:

```
RESPONSE LANGUAGE:
The user writes in {{LANGUAGE}}. Always respond in {{LANGUAGE}}.
{{LANGUAGE === 'es' ? 'Responde siempre en español.' : 'Always respond in English.'}}
```

The `language` value must be fetched from the DB user record (already retrieved via `getOrCreateUser()` — it will now include `language`).

---

## 10. App Layout Integration

In `app/layout.tsx`:
- Fetch user language server-side (call `getOrCreateUser()` if authenticated, else default `'es'`).
- Wrap children with `<LanguageProvider initialLanguage={language}>`.

---

## 11. Acceptance Criteria

| # | Criterion | How to Test |
|---|-----------|-------------|
| AC-1 | Default language is Spanish for new users | Create a fresh account → UI shows ES strings |
| AC-2 | Language toggle appears in header (desktop & mobile) | Open app; toggle is visible on ≥768px and on mobile sheet |
| AC-3 | Clicking toggle switches UI strings instantly | Click EN → composer placeholder changes to English; click ES → reverts |
| AC-4 | Language preference is persisted to DB | Switch to EN → refresh page → still EN |
| AC-5 | AI responds in the selected language | Write a journal entry in ES mode → AI responds in Spanish; in EN mode → AI responds in English |
| AC-6 | On next login, language is restored from profile | Log out, log in → language matches last selection |
| AC-7 | Non-authenticated users see Spanish by default | Open landing page without login → default ES strings |

---

## 12. Implementation Order (Dev Agent)

1. `db/schema.ts` — Add `language` column
2. Run `pnpm drizzle-kit push` to migrate
3. `lib/db-utils.ts` — Ensure `language` is returned from `getOrCreateUser`
4. `app/actions/user.ts` — Implement `updateUserLanguage`
5. `lib/translations.ts` — Create translation dictionary
6. `lib/language-context.tsx` — Create context + provider
7. `app/layout.tsx` — Wrap with `LanguageProvider`, seed from DB
8. `components/language-toggle.tsx` — Create toggle component
9. `components/header.tsx` — Add `<LanguageToggle />`
10. `components/journal-composer.tsx` — Use `useLanguage` for placeholder & button
11. `components/journal-feed.tsx` — Use `useLanguage` for empty state
12. `components/snapshot-sidebar.tsx` — Use `useLanguage` for title
13. `app/actions/journal.ts` — Add language directive to Psychologist prompt
14. Build validation gate: `pnpm lint && npx tsc --noEmit && pnpm build`

---

## 13. Notes & Constraints

- **No external i18n library** — keep it simple with the inline dictionary in `lib/translations.ts`.
- `updateUserLanguage` must only be called for authenticated users; the action itself must auth-guard.
- The `LanguageProvider` should optimistically update state first, then persist to DB in the background (fire and forget). This ensures the toggle feels instant.
- The AI language directive uses the DB value fetched at request-time inside the Server Action, not a client-side cookie. This ensures correctness even if the client state is stale.
