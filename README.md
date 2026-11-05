# Family Pot — API

Backend for [Family Pot](https://github.com/family-pot). A REST API built with NestJS that
handles recipients, transfers, recurring-transfer reminders, cost-comparison calculations, and
(from milestone M4) read-only Stellar verification.

Shared product docs, architecture, roadmap and ADRs live in
[family-pot-docs](https://github.com/family-pot/family-pot-docs) — read that first.

## Status

Early scaffold. Features are built incrementally through GitHub issues. See the roadmap in
family-pot-docs.

## Tech stack

- NestJS, TypeScript
- PostgreSQL
- REST (OpenAPI/Swagger docs generated from the API)
- Vitest or Jest for tests, ESLint, Prettier
- Stellar JS SDK, read-only Horizon access — from milestone M4

There is no Soroban/Rust contract in this repo. See
[family-pot-contracts](https://github.com/family-pot/family-pot-contracts) and ADR 0001 in
family-pot-docs for why, and when that could change.

## Rules for financial code

- Never use floating point for money or exchange rates.
- Every calculation has tests, including rounding and edge cases.
- No fabricated exchange rates, fees, savings, or transaction statuses.
- Every value returned by the API carries a provenance: `user-entered`, `calculated`,
  `estimated`, or `verified`.
- This service never requests, stores, or logs a Stellar secret key. Signing happens in the
  user's own wallet; this API only builds unsigned transactions and verifies submitted ones.

## Quick start

Requirements: Node 22+, pnpm, Docker (for Postgres).

```bash
git clone https://github.com/family-pot/family-pot-api.git
cd family-pot-api
pnpm install
cp .env.example .env.local
docker compose up -d db
pnpm start:dev        # http://localhost:4000
```

Run everything CI runs:

```bash
pnpm check   # format:check, lint, typecheck, test, build
```

`pnpm check` is the same command CI runs; the GitHub Actions workflow uses a frozen
lockfile on Node 22.

API docs available at `/api/docs` (Swagger) once the server is running.

## Environment variables

Configuration is loaded from `.env.local` and `.env` (in that order), validated once at
startup, and exposed through the typed `AppConfigService`. The process exits non-zero and
lists every invalid variable before it starts listening.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `4000` | HTTP port, an integer from 1 to 65535 |
| `NODE_ENV` | No | `development` | `development`, `test` or `production` |
| `DATABASE_URL` | Yes | — | Postgres URL, for example `postgres://user:password@localhost:5432/family_pot` |
| `DATABASE_URL_TEST` | No | — | Postgres URL used by integration tests |
| `DATABASE_SSL` | No | `false` | `true` to require TLS for the database connection |
| `CORS_ORIGIN` | No | empty | Comma-separated allowed browser origins such as `http://localhost:3000` |
| `JWT_ACCESS_SECRET` | Yes | — | At least 32 characters; generate a random value and keep it secret |
| `JWT_ACCESS_TTL` | No | `15m` | Access-token lifetime such as `30s`, `15m`, `1h` or `7d` |
| `REFRESH_TOKEN_TTL_DAYS` | No | `7` | Refresh-token lifetime in whole days (1–365) |
| `ALLOW_REMOTE_DB_RESET` | No | `false` | Allows destructive resets outside local development |

For local Postgres, the `DATABASE_URL` usually looks like
`postgres://family_pot:family_pot@localhost:5432/family_pot`. Never commit `.env*` files;
only `.env.example` belongs in the repository.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the shared guidelines in family-pot-docs. Issues are
sized for Drips Wave (Trivial 100 / Medium 150 / High 200 points).

## Security

See [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).