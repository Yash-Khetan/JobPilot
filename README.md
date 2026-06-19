# JobPilot 🧭

**Stop opening 10 tabs to find one internship.**

JobPilot is a real-time internship aggregator that scrapes listings live from Internshala and uses **AI Semantic Matching** against your uploaded resume to find the most relevant opportunities. Tell it your role, city, and minimum stipend — it does the hunting, reads the job descriptions, and matches them to your exact skills and projects!

---

## ✨ Features

- 🔍 **Real-time scraping** — no stale databases; listings are fetched live from Internshala using Playwright.
- 🤖 **AI Semantic Matching** — Powered by Gemini AI. Upload your resume, and JobPilot generates semantic embeddings for your skills. It compares them against live job descriptions and only shows you internships with high match percentages!
- 💰 **Stipend filtering** — set a minimum stipend and only see what's worth your time.
- 🔖 **Bookmark & Track** — Save internships to your personal Kanban board dashboard to track your application status.
- ⚡ **Animated, modern UI** — React + Framer Motion frontend with a premium dark design.

---

## 🖥️ Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite, Framer Motion |
| Backend  | Node.js, Express |
| Database | Neon (Serverless Postgres), Drizzle ORM |
| AI Model | Google Gemini (Embeddings generation) |
| Scraping | Playwright (headless Chromium) |

---

## 📂 Project Structure

```
JobPilot/
├── backend/
│   ├── src/
│   │   ├── index.js             # Express server entry point
│   │   ├── db/                  # Drizzle ORM schema & config
│   │   ├── routes/              # API endpoints (auth, scrape, tracker)
│   │   └── middleware/          # JWT authentication
│   ├── job_matching/            # Resume parsing & Gemini embedding logic
│   ├── services/
│   │   └── internshala_scraper.js # Playwright scraper for Internshala
│   ├── Dockerfile               # Production Docker container
│   ├── render.yaml              # (Optional) Render Blueprint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component & page routing
│   │   ├── index.css            # Global styles & design system
│   │   └── components/          # React components (Landing, Search, Dashboard)
│   ├── Dockerfile               # Multi-stage Docker build for Nginx
│   ├── vercel.json              # Vercel SPA routing rules
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js 18+**
- **Neon Postgres Database URL**
- **Gemini API Key**

### 1. Clone the repo

```bash
git clone https://github.com/Yash-Khetan/JobPilot.git
cd JobPilot
```

### 2. Backend setup

```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env 
# Add your DATABASE_URL, JWT_SECRET, and GEMINI_API_KEY to .env

# Push the database schema
npm run db:push

# Start the API server
npm run dev
```

The API will be available at `http://localhost:3000`.

### 3. Frontend setup (new terminal)

```bash
cd frontend
npm install

# Start the frontend
npm run dev
```

The app will open at `http://localhost:5173`.

---

## 🐳 Deployment

JobPilot is configured for easy deployment on **Render** (Backend) and **Vercel** (Frontend) using Docker.

### Backend (Render Free Tier)
1. Go to the [Render Dashboard](https://dashboard.render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set the **Root Directory** to `backend`.
4. Render will automatically detect the `Dockerfile`.
5. Add your environment variables (`PORT=3000`, `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`).
6. Deploy!

### Frontend (Vercel Free Tier)
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and create a new **Project**.
2. Connect your GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Add the `VITE_API_URL` environment variable pointing to your deployed Render backend URL.
5. Deploy! Vercel will automatically read `vercel.json` for proper React routing.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a PR.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built because we were tired of the same grind · <strong>JobPilot</strong> © 2026
</p>