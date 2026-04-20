# Requirement Doc: [UI-005] Sticky Header, Theme Selector & Responsive Logout Menu [APPROVED]

## Status: APPROVED
**Owner:** Spec Agent
**Date:** 2025-04-20

## Context
The application currently lacks a consistent navigation bar. Users need a way to see their status, toggle between light/dark modes for a personalized experience, and securely log out. This header should be persistent and responsive.

## UI Requirements
- **Sticky Header**: 
  - Position: Top of the viewport.
  - Behavior: `sticky top-0 z-50`.
  - Visuals: Glassmorphism effect (`backdrop-blur`) or solid background with border.
- **Logo/Title**: "Fawredd Thoughts" on the left, linking back to the home page.
- **Theme Selector**:
  - Icon-based toggle (Sun/Moon).
  - Support for `Light`, `Dark`, and `System` modes.
- **Responsive Menu**:
  - **Desktop View**: Theme toggle and "Logout" button/link visible.
  - **Mobile View**: Hamburger menu containing the Theme toggle and Logout option.
- **Logout**: 
  - Integration with Clerk `@clerk/nextjs`.
  - Action: Signs user out and redirects to home/sign-in.

## Acceptance Criteria
1. Header is visible on all pages (added to `app/layout.tsx` or wrap the main content).
2. Header remains fixed at the top when scrolling the journal feed.
3. Theme selector successfully changes the application theme without page reload.
4. On mobile (< 768px), navigation items are tucked into a menu (Sheet or Dropdown).
5. "Logout" button ends the session and redirects the user.
6. Design matches the "Calm Minimal" theme: soft grays, low-contrast borders, clean typography.

## Technical Specs
- **Frontend**: Next.js 16, Tailwind CSS.
- **Theme Management**: `next-themes`.
- **Auth**: Clerk `SignOutButton` or `useClerk().signOut()`.
- **Components**: Shadcn UI `Button`, `DropdownMenu`, `Sheet` (for mobile drawer).
- **Icons**: `lucide-react`.
