# Payment Webhook & Worker System

Webhook router and background worker for processing payment events and performing automatic reconnection tasks on OLT devices.

## Architecture

### Services

- **payment-webhook**: Fastify API exposing webhook endpoints and admin/observability routes
- **payment-worker**: Background worker consuming PGMQ tasks to process reconnections via VPN
- **postgres-db**: PostgreSQL with PGMQ extension pre-installed
- **wireguard**: VPN client for secure access to OLT devices

### Separation of Concerns (SOLID)

Services are separated following Single Responsibility Principle:

```
payment-webhook/     # Receives webhooks, enqueues tasks
payment-worker/      # Processes tasks, manages OLT reconnections
```

**Benefits:**
- Independent deployment and scaling
- Isolated dependencies and testing
- Clear separation of concerns

**Shared resources:**
- PostgreSQL database
- PGMQ queue (`reconnect_queue`)
- Prisma schema

## Quick Start

### Prerequisites

Before running, configure the following:

1. **Environment variables**: Create `.env` files in both `payment-webhook/` and `payment-worker/` with required variables (see Environment Variables section)

2. **OLT credentials**: Edit `payment-webhook/olts.json` and replace `example` placeholders with real OLT credentials

3. **WireGuard config**: Copy `wireguard-config/wg0.conf.template` to `wireguard-config/wg0.conf` and set your WireGuard keys, IPs, and endpoints

### Run with Docker

```bash
git clone <repo-url>
cd automatic-service-control
docker compose up -d --build
```

## Environment Variables

Required for both `payment-webhook` and `payment-worker`:

```env
DATABASE_URL=postgres://postgres:postgres@postgres-db:5432/widelink
RECONNECTION_PGMQ_QUEUE=reconnect_queue
APP_NAME=payment-system
APP_VERSION=1.0.0
LABSMOBILE_USERNAME=your_username
LABSMOBILE_TOKEN=your_token
LABSMOBILE_MSG=your_message_template
OLT_ENCRYPTION_KEY=  # Auto-generated if not set (64 hex chars)
```

## Network Architecture

### Worker VPN Configuration

The **payment-worker** now runs **inside the WireGuard network stack** using:

```yaml
network_mode: "service:wireguard"
```

### Important Notes

- The **worker cannot access other Docker services by name** (like `postgres-db`) because it is **isolated from the default Docker network**.  
- To connect to **PostgreSQL**, use the **host gateway IP** instead of the service name.  
  - Example:  
    ```
    postgres://postgres:postgres@172.20.0.1:54325/widelink
    ```
- This setup assumes the database is **exposed on the host** or is **reachable through the default network gateway**.


## PGMQ with LISTEN/NOTIFY

### Overview

Event-driven task processing using PostgreSQL LISTEN/NOTIFY reduces database load from **43,200 queries/day to ~40 queries/day** (99.9% reduction).

### Architecture

**Before (Polling):**
- Worker polled every 2 seconds
- Constant DB overhead
- Delayed processing

**After (Event-driven):**
- PostgreSQL trigger notifies on new messages
- Instant task processing
- Fallback polling: 15 minutes (8AM-6PM only)

### Implementation

**Database Trigger** (created automatically via entrypoint):
```sql
CREATE OR REPLACE FUNCTION notify_pgmq_enqueue()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('pgmq_new_message', TG_TABLE_NAME::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pgmq_enqueue_trigger
AFTER INSERT ON pgmq.q_reconnect_queue
FOR EACH ROW EXECUTE FUNCTION notify_pgmq_enqueue();
```

**Worker Configuration:**
- Dedicated `listenerClient` for LISTEN/NOTIFY
- Separate from `taskManager` connection
- Processes all pending tasks when notified
- Fallback polling ensures reliability

## API Endpoints

### Admin & Observability

- `GET /` — Status and documentation
- `POST /webhook/uisp/payments` — UISP webhook endpoint
- `GET /PaymentTaskLog/tasks` — List tasks
- `GET /PaymentTaskLog/:id` — Task details
- `GET /queues` — Queue metrics
- `GET /list/by-queue?name=<queue>` — List messages in queue
- `GET /logs` — Tail logs
- `GET /test/e2e` — SSE endpoint for E2E testing

## E2E Testing with Shared Logs

The E2E test endpoint (`/test/e2e`) uses a **shared log volume** to stream real-time logs from both webhook and worker services.

### How it works
Both `payment-webhook` and `payment-worker` write to the same `app.log` file via Docker's `shared-logs` volume. This allows the E2E endpoint to tail a single log file and capture the complete workflow:

1. Webhook receives test payment
2. Task enqueued in PGMQ
3. Worker processes reconnection
4. OLT activation result
5. SMS notification status

### Usage
- **Single test**: `GET /test/e2e` (streams for 60 seconds)
- **Continuous monitoring**: `GET /test/e2e?continuous=true` (streams indefinitely)

The endpoint returns Server-Sent Events (SSE) streaming parsed log messages in real-time.

**Note**: The `shared-logs` volume is configured primarily for testing/debugging purposes. In production, consider centralized logging (CloudWatch, Loki, etc.).

## Code Structure

### payment-webhook
- `src/app.ts` — Fastify app and autoload
- `src/routes/webhook/uisp/payments/index.ts` — Webhook handler
- `src/lib/taskManager.ts` — PGMQ helpers
- `src/lib/olt_services.ts` — OLT credential lookup
- `src/lib/olt_crypto.ts` — AES-256-GCM encryption
- `src/lib/insert_olts.ts` — Seed OLT data
- `src/lib/logger.ts` — Logger configuration

### payment-worker
- `src/worker.ts` — Main worker loop and business logic
- `src/lib/taskManager.ts` — PGMQ interface
- `src/index.ts` — Entry point

## Database

Uses **Supabase Postgres** image (`public.ecr.aws/supabase/postgres:17.4.1.074`) with PGMQ extension pre-installed.

**Why Supabase Postgres?**
- Open-source with robust community support
- Includes PGMQ extension by default (v1.4.4)
- No custom Postgres builds needed
- Compatible with other Supabase extensions (`pgvector`, `pgsodium`)
- Production-ready and actively maintained

Worker enqueues and processes tasks using standard SQL functions: `pgmq.send`, `pgmq.read`, `pgmq.delete`.

**Note:** PGMQ official image was evaluated but presented compatibility issues during testing. Supabase provides a stable alternative with the same core functionality.

Reference: [Supabase Docs — PGMQ Extension](https://supabase.com/docs/guides/queues/pgmq)

## Notes

- **OLT Encryption**: Passwords encrypted with AES-256-GCM using `OLT_ENCRYPTION_KEY`
- **Automatic Setup**: Database, extensions, triggers, and queues created automatically on first run
- **VPN Testing**: Ensure VPN connectivity from deployment region (firewall/geoblocking may affect access)
