# Supply Chain Project Journey

This document explains, in simple language, what we have built so far from the beginning and in the order it happened.

## 1. What this project is

This project is a full-stack web application for analyzing product returns.

In simple words, it helps us answer questions like:

- Which products are getting returned the most?
- Why are customers returning them?
- Are some reviews fake or suspicious?
- Which products are risky for customers to buy?

The project has 4 main parts:

- `data/` for raw input files
- `database/` for MySQL tables and sample data
- `backend/` for the API and AI logic
- `frontend/` for the React dashboard users see

## 2. Step-by-step timeline of what we built

### Step 1: We created the raw project folders

The first commit was `create folder`.

At this stage, we created the starting raw data files:

- `data/raw/inventory.csv`
- `data/raw/sales.csv`
- `data/raw/signals.csv`

This was basically the project foundation. We were setting up the workspace before building the real app.

### Step 2: We created the full project structure

The second commit was `create folder sturture`.

In this step, we created the main folders and starter files for:

- backend
- frontend
- database
- README

This gave the project a clean structure so backend, frontend, and database work could happen separately.

Main starter files created in this stage:

- `backend/server.js`
- `backend/routes.js`
- `backend/db.js`
- `backend/package.json`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/package.json`
- `database/schema.sql`
- `database/seed.sql`
- `README.md`

At this point, the skeleton existed, but most advanced features were not added yet.

### Step 3: We built Phase 1 and then added Phase 2 work

The third commit was `fix phase 1 and create phase 2`.

This was the biggest step. Most of the real project logic was added here.

What was added:

- backend environment setup
- database connection improvements
- a custom `.env` loader
- the AI/NLP engine
- more complete API routes

Important new backend files in this stage:

- `backend/.env.example`
- `backend/load-env.js`
- `backend/nlp-engine.js`

This is the stage where the project became a working intelligence system instead of only a folder structure.

### Step 4: We fixed bugs and completed the frontend experience

The fourth commit was `fix bugs`.

This stage mainly expanded and stabilized the frontend.

We added and improved:

- dashboard page
- products list page
- product detail page
- risk analysis page
- fake review detector page
- reusable UI components
- Vite dev/build setup
- frontend styles and layout

This made the app usable from the browser.

## 3. Database work we completed

The database lives in `database/schema.sql` and `database/seed.sql`.

### `schema.sql`

This file creates the MySQL database and tables.

Tables created:

- `products`
- `reviews`
- `returns`
- `customer_support_tickets`
- `ai_insights`

What each table does:

- `products`: stores product information like name, category, price, rating, sales, and return rate
- `reviews`: stores customer reviews and fields related to suspicious-review and sentiment analysis
- `returns`: stores return records and detailed customer notes
- `customer_support_tickets`: stores customer complaint/support data
- `ai_insights`: stores AI-generated insight data for future caching

This was important because our whole app depends on structured data coming from MySQL.

### `seed.sql`

This file fills the database with realistic sample data.

It includes:

- many products
- many customer reviews
- many returns
- many support tickets

The sample data was designed carefully so the AI logic could find patterns like:

- color mismatch
- size mismatch
- poor quality
- defective products
- misleading product descriptions
- suspicious fake reviews
- safety concerns

This gave us a realistic testing environment even before connecting real business data.

## 4. Backend work we completed

The backend lives inside `backend/`.

Its job is to:

- connect to MySQL
- receive frontend requests
- fetch data
- run AI/rule-based analysis
- send JSON responses back to the frontend

### `backend/server.js`

This is the backend starting point.

What it does:

- starts the Express server
- enables CORS
- enables JSON request parsing
- loads environment variables
- mounts all API routes under `/api`

Default backend port:

- `5000`

### `backend/db.js`

This file creates the MySQL connection pool.

Why it matters:

- instead of opening one new database connection for every request, we reuse connections efficiently
- this makes the backend cleaner and faster

It reads values like:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

### `backend/load-env.js`

This is a custom environment loader.

It reads `backend/.env` manually and loads values into `process.env`.

Why this was useful:

- we did not depend on `dotenv`
- the app can still read database credentials and port settings

### `backend/routes.js`

This file contains the API endpoints.

These routes are the bridge between frontend and database.

Important routes built so far:

- `GET /api/health`
- `GET /api/health/db`
- `GET /api/dashboard/stats`
- `GET /api/dashboard/top-returned`
- `GET /api/dashboard/category-issues`
- `GET /api/dashboard/trends`
- `GET /api/dashboard/issue-distribution`
- `GET /api/dashboard/action-summary`
- `GET /api/dashboard/alerts`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/:id/fake-reviews`
- `GET /api/products/:id/risk-score`
- `GET /api/products/:id/recommendations`

What these routes give us:

- health checks
- dashboard numbers
- charts data
- alert and action-priority summaries
- product list
- one-product deep analysis
- suspicious review analysis
- recommendations for lower-risk alternatives

## 5. AI logic we completed

The main AI logic is in `backend/nlp-engine.js`.

This is not using online AI APIs. It is a rule-based local analysis engine.

That means:

- fast
- free
- offline
- easy to explain

### Main AI features built

#### 1. Issue extraction

Function:

- `extractIssues(text)`

Purpose:

- reads review text, return notes, or support messages
- detects common product problems using keyword groups

Examples of issue types:

- color mismatch
- size mismatch
- poor quality
- defective product
- misleading specs
- material quality issue
- connectivity issue
- software issue
- safety concern
- shipping damage
- sensor inaccuracy

#### 2. Sentiment analysis

Function:

- `analyzeSentiment(text)`

Purpose:

- checks whether text is positive, negative, or neutral

It works by counting positive words, negative words, intensifiers, and negators.

#### 3. Fake review detection

Function:

- `detectFakeReview(review)`

Purpose:

- marks suspicious reviews using rules like:

- too many exclamation marks
- overly promotional language
- repeated superlatives
- very generic wording
- short 5-star reviews
- unverified purchase
- suspicious reviewer names

This helps us spot reviews that may not be trustworthy.

#### 4. Risk score calculation

Function:

- `calculateRiskScore(product, reviews, returns)`

Purpose:

- gives each product a return-risk score from 0 to 100

Factors used:

- return rate history
- review sentiment
- fake review percentage
- issue severity
- average rating

#### 5. Root cause analysis

Function:

- `generateRootCauseAnalysis(product, reviews, returns, tickets)`

Purpose:

- combines reviews, return notes, and support tickets
- explains the main reasons a product is being returned

This is one of the strongest parts of the project because it turns raw complaints into a clear summary.

#### 6. Recommendation generation

Function:

- `generateRecommendations(issues, product)`

Purpose:

- gives improvement suggestions for the business
- gives advice for customers

#### 7. Seller action planning

Function:

- `generateSellerActionPlan(product, rootCause, riskScore)`

Purpose:

- turns root-cause findings into business-owner actions
- assigns a priority, owner, impact, and next review window
- powers the seller action section in the product detail page

## 6. Frontend work we completed

The frontend lives inside `frontend/`.

It is built with:

- React
- Vite
- React Router
- Axios
- Recharts
- Lucide icons

### `frontend/vite.config.js`

This file sets up the frontend dev server.

Important setup done here:

- frontend runs on port `5173`
- requests starting with `/api` are automatically sent to the backend port declared in `backend/.env` (default fallback `5000`)

This is called a proxy and it helps frontend and backend talk smoothly during development.

### `frontend/src/main.jsx`

This is the React entry point.

It:

- imports global CSS
- renders the main `App` component

### `frontend/src/App.jsx`

This is the root app component.

It sets up routing and overall layout.

Routes built so far:

- `/` for Dashboard
- `/products` for product list
- `/products/:id` for product detail
- `/risk-analysis` for portfolio risk view
- `/fake-review-detector` for review trust analysis

### `frontend/src/index.css`

This file defines the global design system.

What we added here:

- dark dashboard theme
- glass-card style
- tables
- badges
- search/filter controls
- tabs
- loading spinner
- responsive layout

This is why the app has a modern dashboard look instead of plain default styling.

## 7. Reusable frontend components we built

### `frontend/src/components/Sidebar.jsx`

This gives permanent navigation on the left side.

Links included:

- Dashboard
- Products
- Risk Analysis
- Fake Review Detector

### `frontend/src/components/StatCard.jsx`

This is used for dashboard metric cards like:

- Total Products
- Total Returns
- Avg Return Rate
- Refund Cost
- Suspicious Reviews

### `frontend/src/components/RiskGauge.jsx`

This shows a visual risk meter using SVG.

It turns a numeric risk score into a clearer visual gauge for users.

### `frontend/src/components/ReviewCard.jsx`

This shows:

- review text
- reviewer
- rating
- suspicious/genuine badge
- fake-review reasons
- sentiment-related info

### `frontend/src/components/LoadingSpinner.jsx`

This is shown while API data is loading.

## 8. Pages we built in the frontend

### Dashboard page

File:

- `frontend/src/pages/Dashboard.jsx`

What it shows:

- top KPI cards
- return trends chart
- issue distribution chart
- category-wise return chart
- top returned products table

This is the main overview page of the project.

### Products list page

File:

- `frontend/src/pages/ProductsList.jsx`

What it does:

- fetches all products
- supports search
- supports category filter
- supports sorting
- opens product detail on click

This page helps users browse the whole catalog.

### Product detail page

File:

- `frontend/src/pages/ProductDetail.jsx`

This is the most detailed page in the app.

It shows:

- product information
- risk gauge
- AI root-cause analysis
- seller action plan
- suspicious vs genuine reviews
- returns history
- support tickets
- better alternatives

This page turns the raw backend analysis into something easy to understand.

### Risk analysis page

File:

- `frontend/src/pages/RiskAnalysis.jsx`

What it does:

- lists products sorted by return risk
- highlights high-risk products
- shows quick portfolio summary cards

This gives a business-level risk overview.

### Fake review detector page

File:

- `frontend/src/pages/FakeReviewDetector.jsx`

What it does:

- lets us choose a product
- shows reliability score
- counts suspicious reviews
- lists flagged reviews with reasons

This makes the fake-review feature visible on its own page.

## 9. Environment setup we completed

We added:

- `backend/.env.example`
- `backend/.env`

Expected variables:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT`

This lets the backend connect to MySQL without hardcoding credentials in source code.

Important note:

- `backend/.env` is local-only and should not be committed
- `.gitignore` is used to exclude local env files, build output, and `node_modules`

## 10. How the full app works together

Here is the complete flow in beginner language:

1. MySQL stores products, reviews, returns, and support tickets.
2. Express backend reads that data.
3. Backend routes send the data into the local AI engine.
4. The AI engine finds issues, fake reviews, sentiment, and risk.
5. Backend sends the results as JSON.
6. React frontend fetches the JSON and shows it in dashboards, tables, cards, and charts.

So the system is:

- database for storage
- backend for logic
- AI engine for analysis
- frontend for presentation

## 11. What has been completed so far

So far, we have successfully completed:

- project folder structure
- database schema
- realistic seed data
- backend server
- database connection
- environment variable loading
- core API routes
- local rule-based AI/NLP engine
- dashboard UI
- products list UI
- product detail UI
- risk analysis page
- fake review detector page
- charts, filters, tabs, badges, and loading states

## 12. Current project status in one line

Right now, this project is already a working full-stack AI-powered returns intelligence dashboard with MySQL, Express, React, and a local rule-based analysis engine.

## 13. Simple beginner summary

If you want to explain this project in a very short way:

“We started by creating the project folders and database files. Then we built a Node.js backend connected to MySQL. After that, we created our own rule-based AI engine to analyze reviews, returns, and support tickets. Finally, we built a React dashboard that shows risk scores, fake review detection, root-cause analysis, and product recommendations in a simple visual way.”
