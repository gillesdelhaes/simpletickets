# SimpleTickets — Roadmap

**Last updated:** 2026-05-31 (session 10)

---

## Philosophy

SimpleTickets is a **Slack-first support tool for technicians**. End users never log in to a web portal — they interact entirely through Slack (DM the bot, react with an emoji, use `/ticket`). The web UI exists for technicians and admins only: working the queue, managing tickets, configuring the system.

This shapes every priority decision below. Features that require an end-user portal account are out of scope.

---

## Current State (shipped)

- **Auth** — local accounts (email + password), admin-created only
- **Ticket lifecycle** — create, update, status transitions, SLA engine, audit trail, duplicate linking
- **Queue & Dashboard** — filtered ticket list, priority/status/assignee filters, SLA badges, unread reply indicators
- **Ticket detail** — public replies + internal notes, metadata panel, full history
- **Slack integration** — emoji reaction creates ticket, `/ticket` modal, DM-to-bot creates ticket, two-way thread sync (web ↔ Slack), field-change notifications posted to thread, unlinked Slack users display their Slack name
- **Notifications** — bell badge (unread replies on assigned tickets), queue row indicators, bell dropdown with navigation
- **Search** — full-text search across ticket titles, descriptions, and reply bodies; ranked results with highlighted snippets; PostgreSQL FTS (`websearch_to_tsquery`); global search bar in top nav
- **Admin panel** — users (with Slack ID linking), categories, SLA policies, audit log, settings (Slack credentials, trigger emoji, two-way sync toggle)
- **Setup wizard** — first-run flow to configure admin account and Slack
- **File attachments** — upload from web composer (images shown inline, other files as authenticated download); Slack→web file sync on thread replies and ticket creation; web→Slack upload via `files_upload_v2`; authenticated blob URL pattern (no JWT in query string)
- **Timezone** — IANA timezone selector in Settings; all timestamps in the web UI respect the configured timezone
- **Slack reply re-open** — replying in a Slack thread on a resolved/closed ticket re-opens it to in_progress (matches web portal behaviour)
- **Slack App Home** — end users see their open tickets (status + priority) in the bot's Home tab; "View thread" button deep-links to the Slack thread; "Submit a new ticket" button opens the `/ticket` modal; refreshes automatically on `app_home_opened` and after modal submission
- **UI polish** — replaced all emoji (👁 🙈 ⚡ 🔧 📊) on the login and setup pages with consistent stroke SVG icons; added show/hide password toggle to login form; changed default trigger emoji from `ticket` to `clipboard`
- **Slack Setup guide** — dedicated admin page (Admin → Slack Setup) with step-by-step instructions, copyable scope/event names, navigation paths, and a feature↔requirement reference table; collapsible hint panel embedded in the OOB setup wizard
- **README** — full rewrite reflecting actual stack, features, and deployment; removed defunct references (Google SSO, SMTP, Makefile); Slack setup points to in-app guide
- **Reporting** — dedicated `/reports` page: date range filter (7d/30d/90d), KPI cards (total, resolved, open, SLA compliance, avg resolution), ticket volume line chart, by-priority and by-status bar charts, horizontal by-category chart, technician performance table with colour-coded SLA%; 6 backend aggregate endpoints
- **Queue & Dashboard improvements** — Reporter column added to both tables; Queue column headers for Priority, Status, and Created are now sortable (click to toggle asc/desc)
- **Security** — in-memory rate limiting on `POST /auth/login` (10 attempts per IP per 60 seconds); CORS confirmed non-issue (frontend uses relative paths, same origin)
- **Docker housekeeping** — merged `docker-compose.prod.yml` into a single `docker-compose.yml`; added log rotation, `no-new-privileges`, and nginx `read_only` hardening; removed `.env.example`
- **Bug fixes** — Unassigned filter in Queue now correctly filters `assignee_id IS NULL` via API param

---

## Next Up

### 2. Slack technician commands
**Priority: medium**

Reduce the need for technicians to leave Slack to act on tickets.

- `/ticket-status TKT-0042` — returns current ticket info as a formatted Slack message
- `/ticket-close TKT-0042` — closes ticket with optional note
- `/ticket-assign TKT-0042 @user` — assigns to a platform user by Slack mention
- `/my-tickets` — DMs the technician a list of their open assigned tickets

---

## Future / Phase 3

These are real features that add meaningful value but depend on the above being stable first.

### AI triage (Gemini via Vertex AI)
On ticket creation, send title + description to Gemini. Show the response to the technician as an "AI diagnosis" panel. Technician can accept (becomes first reply), edit, or dismiss. Never shown to the end user automatically. Configurable per category. Gated on `GOOGLE_CLOUD_PROJECT` being set — no config, no API call, no error.

### Outbound webhooks
Admin-configured webhooks fired on ticket events (created, updated, reply added, status changed, resolved). Payload signed with HMAC-SHA256. Retry on failure. Delivery log in admin panel.

### Knowledge base
Technicians author Markdown articles linked to categories. Surfaced as suggestions when a new ticket is submitted via `/ticket` modal (before the user submits). Articles browsable from Slack Home Tab.

### Dark mode
System-preference-aware. Toggle in the top bar. Persisted in `localStorage`.

---

## Out of Scope

| Feature | Reason |
|---|---|
| End-user web portal | End users interact via Slack only — no accounts, no portal |
| Email notifications (outbound SMTP) | Slack DMs are the notification channel |
| Inbound email (IMAP → ticket) | Organisation uses Slack; email channel adds complexity without use |
| Google Workspace OIDC | Local accounts sufficient; only technicians/admins log in |
| Multi-tenant / multi-org | Single organisation only |
| Asset / CMDB management | Out of scope for this tool |
| ITIL change / problem management | Too heavy for a ~300-person org |
| Microsoft Teams | Organisation uses Slack |
| Native mobile apps | Slack mobile + responsive web covers it |
| Bulk ticket actions from queue | Low volume (~10/day) makes this unnecessary |
