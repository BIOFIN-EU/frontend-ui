# BIOFIN Dashboard — Frontend UI

A Next.js 15 web application for the BIOFIN biodiversity finance platform. It provides multi-user case management, schema-driven multi-step workflows, and interactive risk assessment dashboards for biodiversity finance professionals.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form + Zod |
| Server state | TanStack React Query 5 |
| HTTP | Fetch API (custom `apiFetch` wrapper) |
| Maps | Leaflet / React Leaflet, OpenLayers |
| Charts | Recharts |
| Icons | Lucide React, Heroicons |
| Auth | JWT (localStorage) — Bearer token on every request |

---

## Getting Started

### Docker (recommended)

```bash
docker compose up --build
```

The dev container mounts the source directory so hot-reload works out of the box.

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |

### Local dev

```bash
npm install
npm run dev
```

Create a `.env.local` file (or copy `.env.dev`):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

`NEXT_PUBLIC_API_BASE_URL` is required — the app will throw at startup if it is missing.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Base URL of the backend API |
| `PHYSICAL_API_PREFIX` | No | Path prefix for physical-layer API endpoints |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (header, nav, footer)
│   ├── page.tsx            # Landing page
│   ├── login/
│   ├── signup/
│   ├── profile/
│   ├── cases/
│   │   └── [caseId]/       # Case dashboard + access management
│   ├── workflow/
│   │   └── [caseId]/       # Step-by-step workflow execution
│   ├── risk-model/         # Investment priorities + risk visualisation
│   ├── about/
│   └── support/
│
├── components/
│   ├── cases/              # Case list, dashboard, access management
│   ├── workflow/           # Workflow step types (form, file, map, assignment)
│   ├── panels/             # Data panels (biodiversity loss, species richness, climate)
│   ├── maps/               # Risk map, management actions map
│   ├── risk/               # Risk insight + threshold scale components
│   └── ui/                 # Shared primitives (Select, etc.)
│
├── context/
│   ├── auth.context.tsx    # Auth state — useAuth() hook
│   └── api-error.context.tsx
│
├── services/               # One file per API resource
│   ├── auth.service.ts
│   ├── workflow.service.ts
│   ├── case-*.service.ts
│   └── ...
│
├── lib/
│   ├── api.ts              # Core apiFetch + token management
│   ├── queryClient.ts      # TanStack Query client config
│   ├── format.ts
│   └── ui.ts               # Shared Tailwind button class strings
│
└── types/                  # Shared TypeScript types
```

---

## Key Concepts

### Authentication

`useAuth()` from `auth.context.tsx` exposes `isAuthed`, `user`, `login()`, and `logout()`. Tokens are stored in localStorage and automatically attached as `Authorization: Bearer <token>` headers by `apiFetch`. A 401 response triggers a silent token refresh; on second failure the user is redirected to login.

### Workflow System

Cases move through configurable multi-step workflows. Each step is one of:

- **Form step** — dynamic schema-driven form (rendered by `FormRenderer`)
- **File step** — file upload
- **Map step** — draw geometries on a map
- **Assignment step** — assign a user to a role

Step schemas are fetched from the API; `WorkflowFormAdapter` converts the API schema into the `FormRenderer` field format. Form answers are auto-saved (debounced, 900 ms) as drafts.

### Dynamic Forms

`FormRenderer` supports the following field types: `text`, `number`, `textarea`, `select`, `radio`, `checkbox`, `file`. Fields support conditional visibility via `visible_if` rules evaluated at render time.

### Risk & Data Visualisation

The `/risk-model` page is a dashboard combining interactive maps (Leaflet/OpenLayers), data panels for biodiversity loss, species richness, and climate resilience, plus threshold-scale components for investment prioritisation.

---

## NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Docker

The `Dockerfile` uses multi-stage builds:

- **dev** — Node 20 Alpine, `npm run dev`, source mounted as volume
- **builder** — compiles TypeScript
- **production** — Node 20 Alpine, runs the compiled output

The `docker-compose.yml` connects to an external Docker network called `biofin_network`. Make sure that network exists before running compose:

```bash
docker network create biofin_network
```

To build a standalone image:

```bash
bash build-image.sh          # tags as frontend-ui:1.0.0
VERSION=2.0.0 bash build-image.sh
```

---

## Funding

This project has received funding from the European Union.
