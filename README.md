# EcoTrack Frontend

EcoTrack is an Angular frontend for an AI-powered carbon footprint and sustainability management platform. It covers the project modules from the brief: carbon tracking, goal management, AI-style recommendations, community challenges, profile preferences, reports, rewards, and an admin dashboard.

## Run Locally

```bash
pnpm install
pnpm start
```

Open `http://127.0.0.1:4200/`.

## Build

```bash
pnpm run build
```

## Main Screens

- Dashboard: sustainability score, total emissions, goal progress, activity timeline, and recommendations.
- Carbon Tracker: user-friendly activity form with instant CO2e estimate.
- Goals: goal creation and progress updates.
- Challenges: search, filters, join state, rewards, and community progress.
- Reports: report summary and CSV export preview.
- Profile: location, lifestyle, and environmental interests.
- Admin: monitoring cards, challenge moderation, reports, and notification overview.

## Backend Integration Points

The mock data and persistence live in `src/app/data/ecotrack.service.ts`. Replace local `signal` state and `localStorage` calls with Angular `HttpClient` methods when your Spring Boot APIs are ready.

Suggested API paths:

- `POST /api/auth/login`
- `GET /api/profile`, `PUT /api/profile`
- `GET /api/carbon-entries`, `POST /api/carbon-entries`
- `GET /api/goals`, `POST /api/goals`, `PATCH /api/goals/{id}/progress`
- `GET /api/challenges`, `POST /api/challenges/{id}/join`
- `GET /api/reports/monthly`, `GET /api/reports/export`
