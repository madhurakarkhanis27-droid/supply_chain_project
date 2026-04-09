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

### Database
1. Import `database/schema.sql` into your MySQL server
2. Optionally run `database/seed.sql` for sample data
