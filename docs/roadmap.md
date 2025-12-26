# SprintSpace Roadmap (Trello-core on ERPNext Task/Project)

This roadmap is scoped to:

- ERPNext v15 / Frappe v15
- Lists/columns mapped to `Task.status`

## Phase 1 — Stability & performance

- Split board fetch vs card detail fetch
- Introduce rank-based ordering (`custom_kanban_rank`)
- Standardize API response format
- Tighten permissions + payload validation
- Server-side filtering: assignees, search, due date, type, priority

## Phase 2 — Trello-core features

- Comment authoring in card modal
- Member picker restricted to project members
- Labels per board/project
- Checklists per card
- Activity feed correctness (no hardcoded author, include meaningful events)

## Phase 3 — Collaboration + production hardening

- Realtime updates for card changes & reorders
- Concurrency handling for drag/drop races
- Observability: logs + timings
- Tests (backend + frontend)



