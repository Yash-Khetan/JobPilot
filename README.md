# JobPilot 🧭

**Stop opening 10 tabs to find one internship.**

JobPilot is a real-time job/internship aggregator that scrapes listings from multiple portals and presents them in a single, clean interface. Tell it your role, city, and minimum stipend — it does the hunting so you can just pick what fits.

---

## ✨ Features

- 🔍 **Real-time scraping** — no stale databases; listings are fetched live from source
- 🏢 **Internshala** integration (Indeed, Wellfound, and YC Work at a Startup coming soon)
- 💰 **Stipend filtering** — set a minimum stipend and only see what's worth your time
- 🔗 **Direct apply links** — every result links straight to the original listing
- ⚡ **Animated, modern UI** — React + Framer Motion frontend with a premium dark design

---

## 🖥️ Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite, Framer Motion |
| Backend  | FastAPI, Playwright |
| Scraping | Playwright (headless Chromium) |

---

## 📂 Project Structure

```
JobPilot/
├── backend/
│   ├── main.py                  # FastAPI server & API routes
│   ├── internshala_scraper1.py  # Internshala scraper (Playwright)
│   ├── indeed_scraper.py        # Indeed scraper (WIP)
│   ├── wellfound_scraper.py     # Wellfound scraper (WIP)
│   ├── yc_scraper.py            # YC Work at a Startup scraper (WIP)
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component & page routing
│   │   ├── index.css            # Global styles & design system
│   │   └── components/
│   │       ├── LandingPage.jsx  # Hero, how-it-works, CTA
│   │       └── SearchPage.jsx   # Search form & results list
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**

### 1. Clone the repo

```bash
git clone https://github.com/Yash-Khetan/JobPilot.git
cd JobPilot
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
playwright install chromium
```

### 3. Start the API server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 4. Frontend setup (new terminal)

```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

---

## 📡 API Reference

### `GET /intershala_jobs`

Scrape Internshala for matching internships.

| Parameter  | Type   | Required | Description                |
|------------|--------|----------|----------------------------|
| `role`     | string | ✅       | Job role (e.g. `Backend Development`) |
| `location` | string | ✅       | City (e.g. `Mumbai`)       |
| `stipend`  | string | ❌       | Minimum stipend filter     |

**Example:**

```
GET /intershala_jobs?role=frontend+development&location=bangalore&stipend=10000
```

**Response:**

```json
[
  {
    "role": "Frontend Development Intern",
    "company": "Acme Corp",
    "location": "Bangalore",
    "stipend": "₹15,000 /month",
    "description": "Work on React dashboards...",
    "link": "https://internshala.com/internship/detail/..."
  }
]
```

---

## 🛣️ Roadmap

- [x] Internshala scraper
- [ ] Indeed scraper
- [ ] Wellfound (AngelList) scraper
- [ ] YC Work at a Startup scraper
- [ ] WhatsApp / email alerts for new listings
- [ ] Saved searches & filters
- [ ] Deploy to the web (Vercel + Railway / Render)

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a PR.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built because we were tired of the same grind · <strong>JobPilot</strong> © 2025
</p>