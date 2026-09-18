<div align="center">

# Stash — AI-Powered Personal Finance

**Track. Budget. Grow. Understand your money with AI.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native%20%2B%20Expo-61DAFB?style=flat-square&logo=react)](https://expo.dev)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square&logo=google)](https://aistudio.google.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Language-Python%203.11+-3776AB?style=flat-square&logo=python)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

Stash is a **full-stack, production-quality personal finance app** built with FastAPI and React Native (Expo). It gives you complete visibility into your money — track every transaction, manage budgets, chase savings goals, monitor subscriptions, and get intelligent insights from a private AI assistant powered by Google Gemini.

---

## Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT + refresh tokens, bcrypt password hashing |
| 💸 **Transactions** | Income & expense tracking with categories, payment methods, notes |
| 📊 **Insights** | Donut charts, spending trends, month-over-month comparisons |
| 💰 **Budgets** | Category budgets with real-time utilization tracking |
| 🎯 **Savings Goals** | Goal tracking with progress bars and quick contributions |
| 🔄 **Recurring Expenses** | Subscription management with upcoming payment alerts |
| 🤖 **Stash AI** | Private AI chat powered by Gemini with your real financial data |
| 📱 **Dark UI** | Sleek dark-mode mobile app with glassmorphism and micro-animations |
| 📥 **CSV Export** | Download all your transactions as a CSV |
| 🔒 **Data Isolation** | Every query is scoped strictly to the authenticated user |

---

## Project Structure

```
Stash/
├── backend/                        # Python · FastAPI
│   ├── app/
│   │   ├── api/endpoints/          # auth · transactions · budgets · finance
│   │   │                           # dashboard · ai · profile · insights
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic settings (reads .env)
│   │   │   └── security.py         # JWT · bcrypt
│   │   ├── db/database.py          # SQLAlchemy engine + session
│   │   ├── models/                 # ORM models (User, Transaction, Budget...)
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   └── services/
│   │       ├── analytics.py        # Pandas-powered financial calculations
│   │       └── ai_service.py       # Gemini AI abstraction layer
│   ├── alembic/                    # Database migrations
│   ├── tests/                      # Pytest suite
│   ├── seed.py                     # Demo data seeder
│   ├── requirements.txt
│   └── .env.example
│
├── mobile/                         # TypeScript · React Native · Expo
│   ├── src/
│   │   ├── components/             # Button · Input · EmptyState · Skeleton
│   │   ├── constants/
│   │   │   ├── api.ts              # Base URL + all API endpoints
│   │   │   └── theme.ts            # Colors · typography · spacing
│   │   ├── context/AuthContext.tsx
│   │   ├── hooks/                  # useDashboard · useTransactions
│   │   ├── navigation/             # Stack + bottom-tab navigator
│   │   ├── screens/
│   │   │   ├── auth/               # Login · Register · Forgot Password
│   │   │   ├── onboarding/         # 4-slide intro
│   │   │   ├── home/               # Dashboard
│   │   │   ├── transactions/       # List · Detail · Add/Edit
│   │   │   ├── budgets/            # Budgets · Goals · Recurring
│   │   │   ├── insights/           # Charts & analytics
│   │   │   ├── ai/                 # Stash AI chat
│   │   │   └── profile/            # Account · Settings · Export
│   │   ├── services/api.ts         # HTTP client with auto token-refresh
│   │   ├── types/index.ts          # TypeScript type definitions
│   │   └── utils/formatting.ts     # Currency · date · INR formatters
│   └── App.tsx
│
└── docker-compose.yml              # PostgreSQL + Redis (optional)
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| Expo Go | Installed on your phone |
| Docker Desktop | Optional (SQLite works without it) |

---

### 1. Clone the repo

`ash
git clone https://github.com/mayankbohara0-dev/Stash.git
cd Stash
`

---

### 2. Set up the Backend

`ash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
`

Edit ackend/.env and set your values:

`env
GEMINI_API_KEY=your_gemini_api_key_here   # https://aistudio.google.com
SECRET_KEY=any_long_random_string
DATABASE_URL=sqlite:///./moneymate.db
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
`

Run migrations and (optionally) seed demo data:

`ash
alembic upgrade head
python seed.py   # optional — loads demo user + sample transactions
`

Start the API server:

`ash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
`

- Swagger docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

---

### 3. Set up the Mobile App

`ash
cd mobile
npm install
`

Open mobile/src/constants/api.ts and update the backend URL:

`	s
// If your phone and PC are on the same WiFi, use your PC's local IP
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:8000';

// For Android emulator
export const API_BASE_URL = 'http://10.0.2.2:8000';
`

> Tip: Find your local IP with ipconfig (Windows) or ifconfig (macOS/Linux).

Start Expo:

`ash
npx expo start --lan
`

Scan the QR code with **Expo Go** on your phone.

---

### 4. Demo Credentials

After running python seed.py:

| | |
|---|---|
| **Email** | demo@moneymate.app |
| **Password** | Demo@1234 |

---

## Stash AI

Stash AI is a private financial assistant powered by **Google Gemini**. It has read-only access to your structured financial data and can answer questions like:

- *"Where did most of my money go this month?"*
- *"What is my savings rate compared to last month?"*
- *"How close am I to my vacation savings goal?"*
- *"What subscriptions am I paying for?"*

**Security model:**
- The AI never touches raw database queries
- It receives only a curated FinancialContext object — no passwords, tokens, or other users' data
- Rate-limited to 10 requests per user per minute
- Read-only — it cannot create, modify, or delete anything

---

## Security

- Passwords hashed with **bcrypt**
- Short-lived JWT access tokens (30 min) + long-lived refresh tokens (30 days)
- Every database query filtered by user_id — strict data isolation
- API key lives only in .env (gitignored) — never in source code
- User messages sanitized and length-limited before reaching the AI

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| DATABASE_URL | Yes | SQLite or PostgreSQL connection string |
| SECRET_KEY | Yes | JWT signing key — keep secret |
| GEMINI_API_KEY | Yes (for AI) | Google Gemini API key |
| AI_PROVIDER | No | gemini or openai (default: gemini) |
| AI_MODEL | No | Model name (default: gemini-2.5-flash) |
| DEBUG | No | true enables Swagger /docs |
| CORS_ORIGINS | No | Comma-separated allowed origins |

---

## Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| FastAPI | Async Python web framework |
| SQLAlchemy | ORM |
| Alembic | Database migrations |
| Pydantic | Request/response validation |
| Pandas | Financial data calculations |
| bcrypt + python-jose | Auth & security |
| httpx | Async HTTP (Gemini API calls) |

### Mobile
| Tool | Purpose |
|---|---|
| React Native + Expo | Cross-platform mobile |
| TypeScript | Type safety |
| React Navigation | Stack + bottom tabs |
| react-native-gifted-charts | Bar + donut charts |
| expo-linear-gradient | UI gradients |
| AsyncStorage | Token persistence |

---

## Running Tests

`ash
cd backend
pytest tests/ -v
`

Covers: auth flows, transaction CRUD, user data isolation, budgets, savings goals, and edge cases.

---

## License

MIT — for personal and educational use. Stash is not a licensed financial advisor.
