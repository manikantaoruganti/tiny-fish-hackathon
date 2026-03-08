Here’s a **clean, hackathon-ready version** of your README with **all Replit-specific traces removed**, while keeping the exact same structure, descriptions, and technical details:

---

# DriftGuard AI – Autonomous Web Monitoring Agent

DriftGuard AI is an autonomous web monitoring dashboard that tracks changes on public websites using intelligent content detection. Built for the TinyFish Hackathon.

## 🚀 Features

* **Autonomous Web Agent**: Modular agent architecture ready for TinyFish API integration
* **Change Detection**: Intelligent similarity-based content comparison with Levenshtein distance
* **Real-time Monitoring**: Track multiple websites with status badges (active, monitoring, updated, error)
* **Change History**: Complete audit trail of all detected changes
* **Professional Dashboard**: Modern React UI with status indicators and monitoring controls
* **PostgreSQL Storage**: Persistent storage of snapshots and change history

## 🛠️ Tech Stack

**Frontend:**

* React + Vite + TypeScript
* TanStack Query for data management
* Shadcn UI components + Tailwind CSS
* Framer Motion for animations
* Wouter for routing

**Backend:**

* Node.js + Express + TypeScript
* PostgreSQL (via Drizzle ORM)
* Axios for HTTP requests
* Modular agent architecture

## 📦 Project Structure

```
driftguard-ai/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Dashboard, Add Site, History
│   │   └── hooks/          # React Query hooks
├── server/                  # Express backend
│   ├── agents/
│   │   └── webAgent.ts     # Modular web scraping agent
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database layer
│   └── db.ts               # Database connection
├── shared/                  # Shared types & schemas
│   ├── schema.ts           # Drizzle schema + Zod types
│   └── routes.ts           # API contract
```

## 🔌 API Endpoints

* `GET /api/monitor/list` - List all monitored sites
* `POST /api/monitor/add` - Add a new site to monitor
* `POST /api/monitor/check` - Run agent check on all or specific site
* `GET /api/monitor/:id/history` - Get change history for a site
* `DELETE /api/monitor/:id` - Remove site from monitoring

## 🤖 Agent Architecture

The web agent (`server/agents/webAgent.ts`) is designed as a standalone module:

* **Modular Design**: Easy to swap with TinyFish Web Agent API
* **Content Extraction**: Strips HTML, extracts meaningful text
* **Change Detection**: 95% similarity threshold with configurable sensitivity
* **Error Handling**: Graceful fallbacks for failed requests

## 🚦 Getting Started

### Prerequisites

* Node.js 18+
* PostgreSQL database

### Installation

```bash
npm install
npm run db:push    # Push database schema
npm run dev        # Start development server
```

The app will be available at `http://localhost:5000`

### Seeded Data

On first run, the database is pre-populated with example monitored sites:

* example.com
* wikipedia.org
* news.ycombinator.com

## 🎯 Usage

1. **Add Website**: Navigate to "Add Monitor" and enter a URL
2. **Run Check**: Click "Run Agent Check" to scan all sites for changes
3. **View History**: Click on any site to see its change detection history
4. **Monitor Status**: Color-coded badges show site status at a glance

## 🔐 Security & Ethics

* Read-only monitoring of public websites
* No login automation or credential storage
* Respects robots.txt and rate limiting
* User-Agent identification in requests

## 🎨 Status Indicators

* 🟢 **Active**: Site monitored, no recent changes
* 🟡 **Monitoring**: Agent check in progress
* 🟣 **Updated**: Changes detected in last check
* 🔴 **Error**: Failed to fetch site

## 📊 Future Enhancements

* Integration with TinyFish Web Agent API
* Scheduled automatic monitoring with node-cron
* Email/webhook notifications for changes
* Advanced diff visualization
* Custom monitoring intervals per site
* Export change reports

## 🏗️ Built for TinyFish Hackathon

This project demonstrates:

* Clean, modular architecture
* Production-ready code quality
* Scalable agent design pattern
* Professional UI/UX
* Comprehensive error handling
* Real database integration

## 📝 License

MIT License – Built for educational purposes and hackathon submission.

🌐 Live Demo

https://incomparable-yeot-ec5612.netlify.app/
