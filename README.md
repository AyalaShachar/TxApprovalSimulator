# Transaction Approval Simulator

A full-stack **Transaction Approval Simulator** built for the Shva take-home task.
A user picks a **region** (country) and a **time**; the backend converts that exact
moment into the selected region's **local time** and approves the transaction only if
it falls within standard banking hours (**08:00–18:00**). Every submission — approved
or rejected — is stored, and the approved ones are listed in the bottom cards.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 19 (standalone components, signals) |
| Backend | .NET 9 Web API (C#), Entity Framework Core |
| Database | Microsoft SQL Server |
| Auth | JWT + BCrypt password hashing |
| i18n | ngx-translate (English / Hebrew, RTL & LTR) |

## Features

- **Region + time picker** matching the Figma design, fully responsive.
- **Time-zone–aware approval** — the submitted instant is converted to the region's
  local time (DST-aware via `TimeZoneInfo`) before checking banking hours.
- **Persistence** of all transactions in SQL Server via EF Core.
- **Bonus — Localization:** English/Hebrew toggle with full RTL/LTR layout support.
- **Bonus — Authentication:** login/signup modal with JWT; the app is usable as a
  guest, so login is optional.
- **Bonus — Containerization:** run the whole stack (client + API + database) with a
  single command.

---

## The core business rule

The submitted time is treated as an **exact moment in time** (an ISO‑8601 instant with
offset, e.g. `2026-06-18T20:00:00+03:00`). The backend converts that instant into the
local wall‑clock time of the selected region and then applies the rule:

> Approved if the local time is **≥ 08:00 and < 18:00**, otherwise Rejected.

Supported regions and their time zones: France (Europe/Paris), Israel (Asia/Jerusalem),
Cyprus (Asia/Nicosia), Italy (Europe/Rome), USA (America/New_York), Japan (Asia/Tokyo).

---

## Option A — Run everything with Docker (recommended)

**Prerequisite:** [Docker Desktop](https://www.docker.com/products/docker-desktop/).

From the repository root:

```bash
docker compose up --build
```

This starts three containers:

| Service | URL |
|---------|-----|
| **Client** (Angular via nginx) | http://localhost:8080 |
| **API** (.NET) | http://localhost:5254 |
| **Database** (SQL Server) | localhost:1433 |

The database schema is created automatically — the API applies EF Core migrations on
startup (with retries while the SQL Server container finishes booting). Open
**http://localhost:8080** and you're ready.

To stop and remove the containers:

```bash
docker compose down          # keep the data volume
docker compose down -v       # also delete the database volume
```

---

## Option B — Run locally (without Docker)

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org) and the Angular CLI (`npm install -g @angular/cli`)
- A SQL Server instance. On Windows, **SQL Server LocalDB** (installed with Visual
  Studio) works out of the box and is the default.

### 1. Database setup

The default connection string (in `TxApprovalSimulator.API/appsettings.json`) targets
LocalDB:

```
Server=(localdb)\MSSQLLocalDB;Database=TxApprovalSimulator;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true
```

If you use a different SQL Server, update that connection string (or set the
`ConnectionStrings__DefaultConnection` environment variable).

You don't need to create the database manually — **migrations are applied automatically
when the API starts**. If you prefer to apply them explicitly:

```bash
cd TxApprovalSimulator.API
dotnet tool install --global dotnet-ef   # once, if not already installed
dotnet ef database update
```

### 2. Run the API

```bash
cd TxApprovalSimulator.API
dotnet run --launch-profile http
```

The API listens on **http://localhost:5254**.

### 3. Run the client

In a second terminal:

```bash
cd TxApprovalSimulator.Client
npm install
npm start
```

The client runs on **http://localhost:4200** and is configured to call the API at
`http://localhost:5254` (see `src/environments/environment.ts`).

---

## API endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET`  | `/api/regions` | List of supported regions (for the dropdown) |
| `POST` | `/api/transactions` | Submit a simulation `{ region, timestamp }` → `Approved`/`Rejected` |
| `GET`  | `/api/transactions/approved` | Approved transactions (for the bottom cards) |
| `POST` | `/api/auth/signup` | Create an account → returns a JWT |
| `POST` | `/api/auth/login` | Log in → returns a JWT |
| `GET`  | `/api/auth/me` | Current user (requires a Bearer token) |

Example simulation request:

```bash
curl -X POST http://localhost:5254/api/transactions \
  -H "Content-Type: application/json" \
  -d '{ "region": "France", "timestamp": "2026-06-18T20:00:00+03:00" }'
# 20:00 in Israel is 19:00 in France → Rejected
```

---

## Project structure

```
TxApprovalSimulator/
├─ docker-compose.yml            # runs client + API + database
├─ TxApprovalSimulator.API/      # .NET 9 Web API
│  ├─ Controllers/               # Transactions, Regions, Auth
│  ├─ Services/                  # TransactionService, JwtTokenService, RegionTimeZones
│  ├─ Data/                      # AppDbContext
│  ├─ Models/ Dtos/ Migrations/
│  └─ Dockerfile
└─ TxApprovalSimulator.Client/   # Angular 19 app
   ├─ src/app/components/        # region-select, approved-transactions, auth
   ├─ src/app/services/          # transaction, language, auth
   ├─ public/i18n/               # en.json, he.json
   └─ Dockerfile, nginx.conf
```

---

## Notes

- **CORS:** in development the API allows any `localhost` / `127.0.0.1` origin, so the
  client works regardless of the port it runs on.
- **JWT / connection string:** values in `appsettings.json` are for local development
  only. In Docker they are supplied via environment variables in `docker-compose.yml`.
