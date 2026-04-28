# Spec-Driven Development — web-sikyon

This directory follows the [Spec Kit](https://github.com/github/spec-kit) approach to spec-driven development.

## Inheritance

```
infra-k8s/.specify/memory/constitution.md    ← primary (GitOps, secrets, security, clean code)
        ↓
web-sikyon/.specify/memory/constitution.md   ← this file (geospatial data, test baseline, map UI)
```

All infra-k8s principles apply here. Read that first if you are new to the project.

## Recommended first spec

There are currently no tests in either package. The first spec should establish the testing baseline:

```
.specify/specs/001-testing-baseline/
├── spec.md    # Acceptance: 75% coverage, CI gates hard-fail, ESLint on backend
├── plan.md    # Vitest + Testing Library (frontend), Jest + Supertest (backend), migrate from react-scripts
└── tasks.md   # Ordered tasks per package
```

## Structure

```
.specify/
├── memory/
│   └── constitution.md   # Governing principles for this repo
└── specs/
    └── <###-feature>/    # One directory per feature/initiative
        ├── spec.md       # What to build (functional requirements)
        ├── plan.md       # How to build it (technical design)
        └── tasks.md      # Ordered implementation steps
```

## Key commands

```bash
yarn dev                          # Frontend (3100) + backend (3180)
yarn test                         # All tests (once established)
yarn workspace frontend lint      # ESLint — must be zero warnings
```
