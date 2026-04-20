# Requirement Doc: [UI-001] Main Journal Layout & Sidebar [APPROVED]

## Status: APPROVED
**Owner:** Spec Agent
**Date:** 2025-04-20

## Context
Create the main layout for the application, featuring a left main area for the journal feed and a right sidebar for the "Life Snapshot" dashboard.

## UI Requirements
- **Layout**: Two-column responsive layout.
- **Left Column**: 
  - Journal entry history (feed).
  - New journal entry text area at the bottom or top.
- **Right Sidebar**:
  - Contains information cards for:
    - Problems
    - Objectives
    - Social Circle
    - Activities
    - Psychological Profile
  - Should be sticky or have its own scroll area.
- **Theme**: Subtle, calming colors (Soft Gray/Blue).

## Acceptance Criteria
1. `app/dashboard/page.tsx` (or similar) implements the layout.
2. Sidebar displays components correctly on desktop.
3. Sidebar collapses or moves to bottom on mobile.
4. Navigation includes access to settings or profile if needed.

## Technical Specs
- **Components**: Shadcn UI Sidebar, Card, ScrollArea.
- **Responsive**: Tailwind `lg:flex-row`.
