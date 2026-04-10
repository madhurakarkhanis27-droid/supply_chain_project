# Supply Chain Management

A full-stack supply chain management application.

## Project Structure

```
project-root/
│
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │
│   ├── package.json
│
├── backend/           # Express.js backend
│   ├── server.js
│   ├── db.js
│   ├── routes.js
│   ├── package.json
│
├── database/          # SQL scripts
│   ├── schema.sql
│   ├── seed.sql
│
├── README.md
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

Optional backend environment setup:
```bash
cp .env.example .env
```

Set these values in `backend/.env` or in your shell before starting:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT`

The frontend dev server reads the backend port from `backend/.env` and proxies `/api` requests to that target automatically. If you change `PORT`, restart both the backend and frontend dev servers.

### Database
1. Import `database/schema.sql` into your MySQL server
2. Optionally run `database/seed.sql` for sample data

### Health Checks
- API: `http://localhost:<PORT>/api/health`
- Database: `http://localhost:<PORT>/api/health/db`

Additional dashboard endpoints:
- `GET /api/dashboard/action-summary`
- `GET /api/dashboard/alerts`
