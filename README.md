# Food Saver — Frontend

React (Vite) + Tailwind CSS frontend for Food Saver, connecting restaurants and
individuals with surplus food to nearby NGOs and volunteers.

Backend API repo: see the separate `FoodSaver_backend` project — this app talks
to it over HTTP and expects it to be running/deployed independently.

## Stack

- React + React Router
- Tailwind CSS v4
- Recharts (impact charts)
- Axios

## Local setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend's URL
npm run dev
```

Runs on `http://localhost:5173`. `VITE_API_URL` must point at a running
instance of the backend API (defaults to `http://localhost:5050/api`).

## Deploying (Vercel)

1. Import this repo into Vercel — it auto-detects the Vite build (`npm run
   build`, output directory `dist`).
2. In the Vercel project's **Settings → Environment Variables**, add
   `VITE_API_URL` pointing at your deployed backend, e.g.
   `https://your-backend.onrender.com/api`. This is baked in at build time, so
   redeploy after changing it.
3. On the backend, make sure `CLIENT_ORIGIN` is set to this Vercel deployment's
   URL so CORS allows requests from it.

## Pages

- `/` — landing page with live donation feed and platform stats
- `/login`, `/register` — auth (donor / NGO / volunteer roles)
- `/donate`, `/my-donations` — donor flow
- `/browse`, `/my-claims` — NGO/volunteer flow
- `/impact`, `/leaderboard` — impact stats and gamified leaderboard
