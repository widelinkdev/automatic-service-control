# Webhook Router — Payment Webhook

Quick summary
-------------------
This project implements a webhook router and a worker to process payment events and perform reconnection tasks on OLT devices.

- API (Fastify) exposing webhook endpoints and admin/observability endpoints.
- Background worker consuming a Postgres-backed queue (`pgmq`) to process reconnection tasks.
- `docker-compose.yml` orchestrates services including Supabase Postgres (with `pgmq`) and WireGuard.

Important before you run
--------------------------------

1. Edit `payment-webhook/.env` and set required environment variables (see list below) before starting the stack.
2. Edit `payment-webhook/olts.json` to replace `example` credentials with real OLT credentials. Currently seed data uses `example` placeholders.
3. Copy `wireguard-config/wg0.conf.template` to `wireguard-config/wg0.conf` and replace placeholders with your real WireGuard keys, IPs, and endpoints.

Run with Docker
---------------------
 Clone the repository and go to the project root:

```bash
git clone <repo-url>
cd automatic-service-control
```

```powershell
# From repo root
docker compose up -d --build
```

Environment variables
--------------------------

Required/important env vars:

- `DATABASE_URL` — e.g. `postgres://postgres:postgres@postgres-db:5432/widelink`
- `RECONNECTION_PGMQ_QUEUE` — pgmq queue name
- `WORKER_ENABLED` — `true` or `false`
- `APP_NAME`, `APP_VERSION` — required by `src/config.ts`
- `LABSMOBILE_USERNAME`, `LABSMOBILE_TOKEN`, `LABSMOBILE_MSG` — SMS config 
- `OLT_ENCRYPTION_KEY` — 64 hex chars (32 bytes) for AES-256-GCM encrypt/decrypt of OLT passwords. Automatically generated when the environment starts if it does not already exist.

Admin / Observability endpoints
-----------------------------------

- `/` — basic status and documentation link (`/docs`)
- `/webhook/uisp/payments` — webhook POST endpoint for UISP events
- `/PaymentTaskLog/tasks` — list tasks
- `/PaymentTaskLog/:id` — task details
- `/queues`, `/list/by-queue?name=<queue>`, `/logs` — queue metrics, list messages, tail logs
- `/test/e2e` — SSE endpoint that triggers a test webhook and streams logs for E2E debugging

Where to look in code
--------------------------

- `payment-webhook/src/server.ts` — start script and worker toggle
- `payment-webhook/src/app.ts` — Fastify app and autoload
- `payment-webhook/src/lib/worker.ts` — main worker loop and business logic
- `payment-webhook/src/lib/taskManager.ts` — pgmq helpers (send/read/delete)
- `payment-webhook/src/lib/olt_services.ts` — lookup and decrypt OLT credentials
- `payment-webhook/src/lib/olt_crypto.ts` — AEAD encryption for OLT passwords
- `payment-webhook/src/lib/insert_olts.ts` — seed data for OLTs (update credentials)
- `payment-webhook/src/lib/logger.ts` — logger configuration


