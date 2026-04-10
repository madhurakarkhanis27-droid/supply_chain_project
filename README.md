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
copy .env.example .env
```

Set these values in `backend/.env` or in your shell before starting:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT`

### Database
1. Import `database/schema.sql` into your MySQL server
2. Optionally run `database/seed.sql` for sample data

### Health Checks
- API: `http://localhost:5000/api/health`
- Database: `http://localhost:5000/api/health/db`
