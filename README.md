# StatMaster

Interactive self-paced learning platform for **Probability & Statistics**. Master 13 modules, practice 438 questions, use interactive tools, and prepare for exams.

**Guest mode** — no login or database required. Progress saves in your browser.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + shadcn-style UI components
- **JSON content** (modules, questions, exams) — no database
- **localStorage** for progress, streaks, and achievements
- **Recharts** for visualizations
- **KaTeX** for math rendering
- **Framer Motion** for animations
- **Zustand** for practice session state

## Features

- 13 learning modules (Foundations → Exam Prep)
- 438 practice questions with step-by-step solutions
- **33 important exam-style questions** (from course PDF) at `/important`
- Progress tracking, streaks, and achievements (browser-local)
- Distribution Explorer, Probability Calculator, Z-Table Visualizer
- 3 timed mock exams with weakness analysis
- Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js 18+

### Setup

```bash
cd statmaster
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start learning. No account or database setup needed.

## Deploy to Vercel

See **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

1. Push to GitHub and import in Vercel
2. Click **Deploy** — no environment variables required
3. Verify: `/api/health` returns `"mode": "guest"`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run generate:content` | Regenerate question/module JSON |
| `npm run generate:important` | Regenerate important questions from script |
| `npm run validate:content` | Validate content files |

## Project Structure

```
statmaster/
├── app/              # Next.js App Router pages
├── components/       # UI, practice, calculators, visualizations
├── data/             # Module, question, exam JSON
├── lib/              # Content loader, math, guest progress
└── public/diagrams/  # SVG assets
```

## License

MIT
