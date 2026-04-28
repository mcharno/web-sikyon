# web-sikyon Constitution

> This constitution **extends** the [infra-k8s primary constitution](../../infra-k8s/.specify/memory/constitution.md). All principles defined there — GitOps, sealed secrets, network policies, resource constraints, security defaults, clean code, documentation, and changelog — apply here in full. This document adds what is specific to this repo.

## I. This App Has a Defined Scope

web-sikyon is a **read-only archaeological data visualisation platform** for the Sikyon Survey Project. It presents GeoJSON survey data on an interactive map and provides a queryable table interface. It is not a general-purpose CMS.

- New features must serve the core use case: explore, filter, and understand the survey data.
- Do not add features that belong to a different product (user accounts, data submission, editorial workflows). If the scope genuinely needs to expand, write a spec first.
- The dataset originates from Zenodo record 1054450 and is static by nature. The app does not collect data — it displays it.

## II. Testing Must Be Established Before New Features Are Added

There are currently **no tests** in either package. This is the most significant gap in the codebase and must be addressed before new feature work builds on an untested foundation.

- The first spec to write for this repo should establish the test baseline for both packages.
- Target: **75% coverage** across branches, functions, lines, and statements — consistent with web-app.
- Frontend uses **Vitest** + Testing Library (migrate from react-scripts test, which is deprecated). Backend uses **Jest** + Supertest.
- `continue-on-error: true` must be removed from CI test steps once tests exist.
- No new feature is considered done without tests. New work added before the baseline is established must include tests for the new code at minimum.

## III. Monorepo Boundaries Are Respected

Same structure as web-app: Yarn 4 workspace with `frontend` and `backend` packages.

- `frontend/` and `backend/` are separate deployable units with separate Dockerfiles, `package.json` files, and test configs.
- Root `package.json` scripts orchestrate across workspaces. Package-specific scripts run via `yarn workspace <name> <script>`.
- `yarn.lock` changes are always committed.

## IV. Geospatial Data Has Explicit Conventions

The backend serves GeoJSON derived from shapefiles in Greek Grid projection (EPSG:2100). Coordinate handling is a correctness concern, not a detail.

- All source data is stored as GeoJSON in `backend/public/data/`. Do not commit raw shapefiles to the repo — only the converted GeoJSON output.
- Coordinate transformation (EPSG:2100 → WGS84) must use `proj4` and must be tested. Silent transformation errors produce plausible-looking but wrong map positions.
- When adding a new data layer, document in `docs/DATA_MODEL.md`: the source, projection, property schema, and how it was converted.
- Layer colours, filter keys, and display names are configuration, not logic. They belong in a config file, not hardcoded in components.

## V. The Backend Serves Data, Not Business Logic

The Express backend is a data access layer. It reads GeoJSON from disk (and in future, PostGIS) and returns it. It does not transform, rank, or interpret the data.

- Route handlers live in `src/routes/`, any data logic in `src/controllers/` or `src/utils/`. Maintain the separation even as the codebase is small.
- API routes follow the pattern: `GET /api/<resource>`, `GET /api/<resource>/:id`. The `/data/*` path serves static GeoJSON files.
- CORS is restricted to `https://ssp.charno.net` in production. Do not widen it without a documented reason.
- The PostgreSQL + PostGIS path is anticipated but not yet implemented. When it is added, it must follow the same pattern as web-app: optional and degrade gracefully.
- Every new route must have a Supertest route test committed alongside it.

## VI. The Frontend Is a Map-First Interface

The primary interface is a MapLibre GL map. All other views (database table, bibliography) are secondary.

- Map interactions (layer toggle, filter, feature click) are the core UX. Any change that affects map behaviour must be manually verified against real data.
- All API calls go through `src/services/` (or equivalent service layer). Components must not call `axios` directly.
- React Router v6 manages navigation. New pages get a route and a page component in `src/pages/`.
- ESLint must pass with zero warnings before a PR is merged. The backend has no linter — one must be added as part of the testing baseline spec.
- Component files are `PascalCase.jsx`. Service files and utilities are `camelCase.js`.

## VII. Images Are Built for ARM64

Same as web-app — the cluster is ARM64.

- All Dockerfiles produce `linux/arm64` images via QEMU cross-compilation in GitHub Actions.
- Images are tagged by short SHA and pushed to GHCR (`ghcr.io/mcharno/sikyon-backend`, `ghcr.io/mcharno/sikyon-frontend`).
- Image tags in `infra/k8s/base/` are updated by the CI workflow on merge to `main`. Do not manually edit image tags.
- Base images: `node:20-alpine` (backend), `nginx:alpine` (frontend). Pin to a specific minor version when updating.

## VIII. Containers Run Least-Privilege

Container security posture matches web-app.

- Backend runs as non-root (`node` user, UID 1000). Frontend runs as non-root via Nginx.
- `readOnlyRootFilesystem: true` on the frontend. Backend may need writable tmp — scope it with `emptyDir`.
- `capabilities: drop: [ALL]` on all containers.
- `seccompProfile: RuntimeDefault` on all pods.

## Constraints & Requirements

- **Runtime**: Node.js 20+, Yarn 4 (Corepack)
- **Frontend**: React 18, react-scripts (migrate to Vite as part of testing baseline work), MapLibre GL 3, React Router v6
- **Backend**: Express 4, ES modules, proj4 for coordinate transforms
- **Testing**: No tests yet — establish Jest (backend) + Vitest (frontend) as first priority
- **Deployment**: GitHub Actions → GHCR → ArgoCD → k3s, `burnside` namespace
- **Domain**: `ssp.charno.net` (external only — no local LAN ingress defined)
- **Ports**: Backend ClusterIP on 3180, frontend ClusterIP on 8080
- **Data**: GeoJSON in `backend/public/data/`, sourced from Zenodo 1054450 via `scripts/`

## Development Workflow

1. `yarn dev` — starts frontend (port 3100) and backend (port 3180) concurrently.
2. GeoJSON data files must be present in `backend/public/data/` — see `docs/DATA_LOADING_GUIDE.md`.
3. `yarn test` — once tests exist, this must pass before pushing.
4. `yarn workspace frontend lint` — must pass with zero warnings before pushing.
5. Open a PR → CI validates → merge to `main` → GitHub Actions builds images → ArgoCD deploys.
6. Verify: `ssp.charno.net/api/health`.

## Governance

This constitution extends the infra-k8s primary constitution. Conflicts resolve in favour of infra-k8s unless overridden here with a documented reason. Amendments increment the version and are recorded in the Decisions Log.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-27 | GeoJSON-only data storage (no DB yet) | Dataset is static; file-based serving is sufficient until query complexity demands PostGIS |
| 2026-04-27 | CORS restricted to ssp.charno.net | Data is public but the API should not be used as an open proxy by third parties |
| 2026-04-27 | Testing baseline is first priority spec | No tests exist; adding features on an untested codebase compounds the gap |

---

**Version**: 1.0.0 | **Ratified**: 2026-04-27 | **Last Amended**: 2026-04-27
