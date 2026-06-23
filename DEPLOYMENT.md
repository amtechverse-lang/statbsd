# StatMaster — no database required (guest mode)

Progress is saved in the browser via localStorage. No login, no Neon/PostgreSQL.

## Deploy to Vercel

1. Import [github.com/amtechverse-lang/statbsd](https://github.com/amtechverse-lang/statbsd)
2. Click **Deploy** — no environment variables needed
3. Visit `/api/health` — should show `"mode": "guest"`

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Content

- Modules & lessons: `data/modules/`
- Practice questions: `data/questions/`
- Important exam questions: `data/questions/important-questions.json`
- Regenerate important set: `npm run generate:important`
- Validate: `npm run validate:content`
