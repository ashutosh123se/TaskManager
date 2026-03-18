# TaskMaster Pro

A production-ready Task Management Web Application built with a robust Node.js backend and a sleek Next.js (App Router) frontend.

## Overview

The application is structured as a monorepo consisting of:
- **Backend**: Express + PostgreSQL + Prisma ORM. Provides RESTful API endpoints secured by JSON Web Tokens (HTTP-only cookies) and AES-256-GCM encryption for sensitive text.
- **Frontend**: Next.js 15 App router. Tailored with Tailwind CSS for a premium design aesthetic, featuring real-time debounce searching, filtering, and pagination.

## Security & Architecture Features
- **Proper Authentication**: JWT issues stateless auth tokens stored in Secure, HTTP-Only cookies to prevent Cross-Site Scripting (XSS).
- **Password Hashing**: Bcrypt salt & hash implementation.
- **Data Privacy**: Task descriptions are encrypted at the application level using `crypto-js` / native AES encryption prior to Database persistence.
- **Validation**: All API inputs are rigorously validated using `zod` schema middleware.
- **Error Handling**: Standardized error formatter to avoid stack trace leaks in production.

## Local Setup

### 1. Database Configuration
Ensure you have a PostgreSQL database running. You may use Docker or a cloud provider like Neon/Supabase.
Update `backend/.env` with your desired `DATABASE_URL`.

### 2. Backend Installation
cd backend
npm install
# Push the schema to the database (creates tables)
npx prisma db push
# Generate the Prisma Client
npx prisma generate
# Start the server on http://localhost:5000
npm run dev

### 3. Frontend Installation
cd frontend
npm install
# Start the Next.js dev server on http://localhost:3000
npm run dev

## Production Deployment

### Backend (Render / Railway / AWS)
1. Provide environment variables (`DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `FRONTEND_URL`, `NODE_ENV=production`).
2. Add build script: `npm install && npx prisma generate`
3. Add start command: `node src/index.js`
4. The `cors` configuration automatically verifies `process.env.FRONTEND_URL` and `secure: true` cookies activate logic protecting sessions in HTTPS scenarios.

### Frontend (Vercel / Netlify)
1. Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api`
2. Build command: `npm run build`
3. Vercel automatically deploys the App Router output securely.
