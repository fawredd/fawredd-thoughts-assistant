# Project Backlog - Fawredd Thoughts Assistant

## Project Overview
AI-assisted journaling web app with "User Life Snapshot" for longitudinal memory and reflective coaching.

## Task List

| ID | Title | Priority | Assignee | Status | Dependencies |
|----|-------|----------|----------|--------|--------------|
| INIT-001 | Project Infrastructure Setup | P0 | Spec | DONE | - |
| DB-001 | Database Schema Design & Migration | P0 | Spec | DONE | INIT-001 |
| AUTH-001 | Clerk Authentication Integration | P0 | Spec | DONE | INIT-001 |
| AI-001 | State Architect & User State Schema | P1 | Spec | DONE | DB-001 |
| AI-002 | Psychologist Agent & Streaming Logic | P1 | Spec | DONE | AI-001 |
| PIPE-001 | Entry Processing Pipeline (Server Actions) | P1 | Spec | DONE | AI-002, DB-001 |
| UI-001 | Main Journal Layout & Sidebar | P2 | Spec | DONE | PIPE-001 |
| UI-002 | Entry Feed & Textarea Components | P2 | Spec | DONE | UI-001 |
| UI-003 | Snapshot Dashboard Cards | P2 | Spec | DONE | UI-001, AI-001 |
| UI-004 | Refactor Journal Feed for RSC & Streaming Optimization | P1 | Spec | TODO | UI-002, PIPE-001 |
| OBS-001 | Observability & Logging implementation | P3 | Spec | DONE | PIPE-001 |
| DEPLOY-001 | Vercel Deployment & Initial UAT | P0 | Dev | TODO | ALL |
| PHASE-2-001 | Security Encryption, UI Polish & Read Aloud | P1 | Dev | REVIEW | UI-004 |

## Task Status Legend
- **TODO**: Waiting for Spec Agent
- **IN_PROGRESS**: Agent currently working on task
- **REVIEW**: Quality Agent validating implementdocker-compose up -dation
- **DONE**: PM Agent moved to DONE after sponsor approval
- **BLOCKED**: Blocked by dependency or external issue
