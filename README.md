# Dynamic Forms Dashboard (Next.js + FastAPI)

A starter repo for **multi-user, multi-step dynamic questionnaires** where:
- **Forms are served by FastAPI** (schema-driven UI)
- Users can **save drafts** and resume later
- Supports **conditional questions** (`visible_if`)
- Supports **form versions** (e.g., v1, v2, latest)

## Quickstart (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API (FastAPI): http://localhost:8000/docs

## Demo credentials
- Email: `demo@example.com`
- Password: `demo`

## How it works

### Backend (FastAPI)
- `POST /auth/login` -> sets an **httpOnly cookie** `access_token`
- `GET /forms/{form_id}/latest` -> returns latest version metadata
- `GET /forms/{form_id}/versions/{version}` -> returns a specific schema version
- `GET /forms/{form_id}/steps/{version}/{step}` -> returns a single step schema
- `GET /me/progress/{form_id}` -> resume state (current step + saved answers)
- `POST /responses/{form_id}` -> autosave (draft) answers for a step

### Frontend (Next.js)
- Renders schemas dynamically with a reusable `FormRenderer`
- Uses React Hook Form + Zod + React Query
- Supports conditional fields via `visible_if` rules

## Local dev without Docker
### API
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Set in `frontend/.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Notes
This repo is intentionally minimal but production-leaning:
- Uses SQLite for demo storage (users + responses)
- Cookie-based auth (JWT) so the browser sends auth automatically with `withCredentials`
- Swap SQLite layer for Mongo/Postgres later without changing the frontend contract much
