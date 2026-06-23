# StatMaster

Interactive self-paced learning platform for **Probability & Statistics**. Master 12 modules, practice 400+ questions, use interactive tools, and prepare for exams.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + shadcn-style UI components
- **PostgreSQL** + Prisma ORM (Neon recommended)
- **NextAuth.js** (credentials authentication)
- **Recharts** for visualizations
- **KaTeX** for math rendering
- **Framer Motion** for animations
- **Zustand** for practice session state

## Features

- 13 learning modules (Foundations → Exam Prep)
- 400+ practice questions with step-by-step solutions
- Progress tracking, streaks, and achievements
- Distribution Explorer, Probability Calculator, Z-Table Visualizer
- 3 timed mock exams with weakness analysis
- Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database ([Neon](https://neon.tech) free tier recommended)

### Setup

```bash
cd statmaster
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET
```

### Database

```bash
# Push schema to database
npm run db:push

# Generate content (if needed)
npm run generate:content

# Seed modules, questions, and exams
npm run db:seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and start learning.

## Deploy to Vercel

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the complete step-by-step guide.

Quick summary:

1. Create a Neon PostgreSQL database (free tier)
2. Push to GitHub and import in Vercel
3. Set `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
4. After deploy: `npx prisma migrate deploy && npm run db:seed`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:seed` | Seed content from JSON |
| `npm run generate:content` | Regenerate question/module JSON |
| `npm run validate:content` | Validate content files |

## Project Structure

```
statmaster/
├── app/              # Next.js App Router pages
├── components/       # UI, practice, calculators, visualizations
├── data/             # Module, question, exam JSON (seed source)
├── lib/              # Auth, math, progress, Prisma client
├── prisma/           # Schema and seed script
└── public/diagrams/  # SVG assets
```

## License

MIT
