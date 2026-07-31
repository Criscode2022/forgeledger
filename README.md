# ForgeLedger

**Production-ready freelance & SMB finance OS** — clients, projects, invoices, expenses, and cash-flow analytics.

| Layer | Stack |
| --- | --- |
| Frontend | Angular 19 (standalone), Tailwind CSS 3, Chart.js |
| Backend | NestJS 11, TypeORM, JWT auth, class-validator |
| Database | **Neon Postgres** in production · SQLite fallback for local/dev |
| Deploy | Single Node process serves API + Angular SPA |

![stack](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)
![nest](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![neon](https://img.shields.io/badge/Neon-Postgres-00E599?logo=postgresql&logoColor=white)
![tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)

## Features

- **Auth** — register / login with bcrypt-hashed passwords and JWT sessions
- **Clients CRM** — contacts, companies, search, archive-ready status
- **Projects** — budgets, hourly rates, lifecycle statuses, client linking
- **Invoices** — multi-line items, tax, status workflow (draft → sent → paid / overdue), print-ready view
- **Expenses** — categories, billable flag, running totals
- **Dashboard** — paid revenue, outstanding AR, overdue, net margin, 6-month cash-flow chart
- **Demo seed** — realistic studio data on first boot

## Demo credentials

```
email:    demo@forgeledger.app
password: demo1234
```

## Monorepo layout

```
apps/
  api/   NestJS REST API (TypeORM + JWT)
  web/   Angular SPA (Tailwind)
```

## Quick start (local)

```bash
# install
npm install

# optional: point at Neon
export DATABASE_URL="postgresql://...@...neon.tech/neondb?sslmode=require"
export JWT_SECRET="your-long-secret"

# build frontend + API
npm run build

# run (API serves Angular static assets on :8080)
npm start
```

Open [http://localhost:8080](http://localhost:8080).

Without `DATABASE_URL`, the API uses a local SQLite file under `data/forgeledger.sqlite`.

### Dev mode (split)

```bash
# terminal 1 — API on 8080
npm run dev:api

# terminal 2 — Angular on 4200 with proxy
cd apps/web && npx ng serve --proxy-config proxy.conf.json --host 0.0.0.0 --port 4200
```

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | prod | Neon / Postgres connection string |
| `JWT_SECRET` | prod | JWT signing secret |
| `PORT` | no | Default `8080` |
| `HOST` | no | Default `0.0.0.0` |
| `DB_SYNC` | no | Schema sync (default on). Set `false` when using migrations. |
| `SKIP_SEED` | no | Skip demo data seeding |
| `SQLITE_PATH` | no | Local SQLite path when no `DATABASE_URL` |

Copy `.env.example` → `.env` for local overrides.

## Neon setup

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the pooled connection string
3. Set `DATABASE_URL` and `JWT_SECRET` on your host
4. Deploy / restart — TypeORM creates tables and seeds the demo user

## API overview

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | no | Health check |
| POST | `/api/auth/register` | no | Create account |
| POST | `/api/auth/login` | no | Login |
| GET | `/api/auth/me` | yes | Current user |
| GET/POST/PATCH/DELETE | `/api/clients` | yes | Clients CRUD |
| GET/POST/PATCH/DELETE | `/api/projects` | yes | Projects CRUD |
| GET/POST/PATCH/DELETE | `/api/invoices` | yes | Invoices CRUD |
| PATCH | `/api/invoices/:id/status` | yes | Status update |
| GET/POST/PATCH/DELETE | `/api/expenses` | yes | Expenses CRUD |
| GET | `/api/dashboard` | yes | Analytics summary |

All business data is **scoped to the authenticated user**.

## Scripts

```bash
npm run build        # build web + api
npm run start        # production API (serves SPA)
npm run dev:api      # Nest watch mode
npm run test         # unit tests (workspaces)
```

## Deploy

### Option A — Docker (recommended for full stack)

```bash
docker compose up --build
# or
docker build -t forgeledger .
docker run -p 8080:8080 -e JWT_SECRET=… -e DATABASE_URL=… forgeledger
```

### Option B — Render / Fly.io

- **Render**: connect this repo and use `render.yaml` (Docker runtime). Set `DATABASE_URL` to your Neon connection string.
- **Fly.io**: `fly launch` using `fly.toml`, then `fly secrets set DATABASE_URL=… JWT_SECRET=…`

### Option C — Neon

1. Create a free database at [neon.tech](https://neon.tech)
2. Copy the pooled connection string (`sslmode=require`)
3. Set `DATABASE_URL` + `JWT_SECRET` on your host
4. Start the app — schema sync + demo seed run automatically

### GitHub

Repository: https://github.com/Criscode2022/forgeledger

## Production notes

- Set a strong `JWT_SECRET`
- Use Neon pooled URL with `sslmode=require`
- Put TLS termination in front (Vercel/Railway/Fly/Nginx)
- Consider disabling `DB_SYNC` after schema stabilizes and managing migrations
- Never commit `.env` or `data/*.sqlite`

## License

MIT
