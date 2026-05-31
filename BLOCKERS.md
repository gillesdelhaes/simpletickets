# SimpleTickets — Production Blockers

**Last updated:** 2026-05-31 (session 10)

---

## Must-fix (blocking production)

| # | Issue | Detail |
|---|-------|--------|
| ~~1~~ | ~~**No rate limiting on login**~~ | ~~`POST /api/auth/login` has no brute-force protection.~~ ✅ Done — 10 attempts/IP/60s in-memory limiter. |
| ~~2~~ | ~~**No restart policy**~~ | ~~Containers do not restart after a server reboot.~~ ✅ Done — `restart: unless-stopped` on all services. |
| ~~3~~ | ~~**No HTTPS**~~ | Handled by the infrastructure layer (GCP load balancer / reverse proxy). Not the app's responsibility. |
| ~~4~~ | ~~**No database backups**~~ | Handled at infrastructure level by the company DevOps team. Not the app's responsibility. |
| ~~5~~ | ~~**No admin recovery**~~ | Mitigated by company password manager. 2FA and password policy hardening deferred to phase 2. |

---

## Should-fix (operational risk)

| # | Issue | Detail |
|---|-------|--------|
| ~~6~~ | ~~**"Unassigned" filter broken**~~ | ✅ Done — `unassigned=true` query param added to API; frontend now passes it correctly. |
| 7 | **No React error boundaries** | A JS exception in any component crashes the entire page to a blank screen. A top-level `ErrorBoundary` component would catch and display a graceful fallback. |
| 8 | **JWT secret hygiene** | The default `app_secret_key` in `config.py` is a weak dev string. Production deployments should override it — ideally via the DB settings or a docker secret. |

> **Note on CORS:** Not a concern. The frontend makes relative `/api/...` calls and is served from the same origin as the API. The browser never makes a cross-origin request, so `allow_origins=["*"]` has no practical effect.

---

## Nice-to-have (not blocking)

- **User deactivation** — currently users can only be deleted, not suspended. A disabled user who still has a Slack account could re-trigger ticket creation.
- **Slack HTTP mode** — Socket Mode works fine for a single org but requires the bot process to maintain a persistent outbound connection. HTTP mode (with a public URL) is more resilient and restartable.
- ~~**Log retention**~~ ✅ — `json-file` driver with `max-size` limits added to all containers in `docker-compose.yml`.

---

## Priority order

1. ~~Rate limiting on login~~ ✅
2. ~~Restart policy~~ ✅
3. ~~HTTPS~~ — handled by GCP infrastructure
4. ~~Database backups~~ — handled by DevOps
5. ~~Admin recovery~~ — mitigated by password manager
6. ~~Unassigned filter~~ ✅
7. Error boundaries — 30 minutes
