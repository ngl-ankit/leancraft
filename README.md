# LeanCraft - AI-Powered Fitness Platform

A Next.js 15 fitness platform with diet planning, workout generation, progress tracking, and an AI coach — backed by a Turso (libSQL) database via Drizzle ORM.

## Tech Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Drizzle ORM + Turso (libSQL)
- bcrypt for password hashing

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your Turso credentials:
   ```bash
   cp .env.example .env
   ```
3. Push the schema to your database (first time / after schema changes):
   ```bash
   npm run db:push
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm run start
```
The start script binds to `process.env.PORT` (falls back to 3000), which is required for platforms like Render that assign a dynamic port.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TURSO_CONNECTION_URL` | Yes | Turso/libSQL database connection URL (e.g. `libsql://<db>.turso.io`) |
| `TURSO_AUTH_TOKEN` | Yes | Turso database auth token |
| `PORT` | No (set by Render automatically) | Port the server listens on |

⚠️ Never commit your real `.env` file — it is git-ignored. Use `.env.example` as a template.

## Deploying to Render

This app is a standard Next.js Node web service (not static export), so deploy it as a **Web Service**.

- **Root Directory**: `.` (repo root)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Environment**: Node
- **Node Version**: 18.18+ (set via `engines` in `package.json`, or add `NODE_VERSION=20` env var on Render)
- **Required Environment Variables**:
  - `TURSO_CONNECTION_URL`
  - `TURSO_AUTH_TOKEN`
- Render automatically provides `PORT`; the start script already respects it.

If you need to apply the Drizzle schema to a fresh Turso database, run `npm run db:push` locally (or via a Render Shell) with the same `TURSO_*` env vars set.
