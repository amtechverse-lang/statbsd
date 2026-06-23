# StatMaster — Vercel Deployment Guide

## Prerequisites

- GitHub account
- [Vercel](https://vercel.com) account (Hobby/free tier)
- [Neon](https://neon.tech) PostgreSQL database (free tier)

## Step 1: Create Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project (e.g. `statmaster`)
3. Copy two connection strings from the dashboard:
   - **Pooled connection** → `DATABASE_URL`
   - **Direct connection** → `DIRECT_URL` (used for migrations)

Example format:
```
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Step 2: Deploy to Vercel

1. Push `statmaster/` to a GitHub repository
2. In Vercel: **Add New Project** → Import the repo
3. Set **Root Directory** to `statmaster` if the repo root is `probab`
4. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct connection string (**required** — build fails without it) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

5. Click **Deploy**

The build runs: `prisma generate && next build` (via `postinstall` + `build` script).

## Step 3: Initialize Database (one-time)

After the first successful deploy, run locally against production DB:

```bash
cd statmaster
# Set DATABASE_URL and DIRECT_URL in .env to your Neon URLs
npx prisma migrate deploy
npm run db:seed
```

Or use Neon's SQL editor — the migration SQL is in `prisma/migrations/20240623000000_init/migration.sql`.

**Seed is required** — without it, modules and questions will be empty.

## Step 4: Verify

1. Visit your Vercel URL
2. Register a new account
3. Open **Module 0: Foundations**
4. Complete a lesson and a practice question
5. Try a mock exam under **Exam Prep**

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `P1001` database connection | Check `DATABASE_URL` uses pooled Neon URL with `?sslmode=require` |
| Login fails after deploy | Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set |
| Empty modules page | Run `npm run db:seed` against production database |
| Build fails on Prisma | Ensure `postinstall` runs `prisma generate` (already in package.json) |

## Free Tier Limits

- **Vercel Hobby**: 100 GB bandwidth, serverless functions
- **Neon Free**: 0.5 GB storage, may sleep after inactivity (first request wakes it)
