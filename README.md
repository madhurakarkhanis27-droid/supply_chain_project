# Supply Chain Management

A full-stack supply chain management application.

## Product Seed Source Of Truth

The repository-owned product catalog lives in `backend/products.json`.

- It contains exactly `267` products.
- `backend/seed_products.js` is the only supported product import path.
- `backend/add_products.js` now forwards to that same canonical seed so older local habits do not create a second dataset.

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
│   ├── products.json
│   ├── seed_products.js
│   ├── package.json
│
├── database/          # SQL scripts
│   ├── schema.sql
│   ├── seed.sql
│
├── README.md
```

## Getting Started

### Fresh Clone Database Setup

Run these steps in order on an empty MySQL database.

1. Install backend dependencies:

```bash
cd backend
npm install
cp .env.example .env
```

2. Set the database credentials in `backend/.env`.

Required values:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME` (`supply_chain` to match the SQL scripts)
- `PORT`

3. Create the schema:

```bash
mysql -h <host> -P <port> -u <user> -p < ../database/schema.sql
```

4. Seed the canonical 267-product catalog:

```bash
npm run seed:products
```

5. Seed the remaining sample users, reviews, returns, and tickets:

```bash
mysql -h <host> -P <port> -u <user> -p < ../database/seed.sql
```

6. Verify the product count:

```sql
SELECT COUNT(*) FROM products;
```

Expected result:

```text
267
```

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

The frontend dev server reads the backend port from `backend/.env` and proxies `/api` requests to that target automatically. If you change `PORT`, restart both the backend and frontend dev servers.

### Health Checks
- API: `http://localhost:<PORT>/api/health`
- Database: `http://localhost:<PORT>/api/health/db`

Additional dashboard endpoints:
- `GET /api/dashboard/action-summary`
- `GET /api/dashboard/alerts`
