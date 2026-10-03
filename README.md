# CWAD Next.js Fullstack Monorepo

A professional Next.js monorepo foundation for production web applications.

This template treats Next.js as the application platform: UI, Server Components, Server Actions, Route Handlers, metadata, error boundaries, loading states, and server-side application logic live inside the Next.js app. Reusable contracts, validation, UI primitives, and utilities live in workspace packages.

## Stack

- Next.js 16.3.5
- React 19.3.0
- TypeScript 5.9
- Turborepo 2.11
- npm workspaces
- Zod
- Vitest
- ESLint
- Prettier

Next.js 16.3.5 and React 19.3.0 are the current stable package releases used by this template at generation time. citeturn0search20turn0search22

## Architecture

```text
monorepo-nextjs/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── api/
│       │   │   └── health/
│       │   │       └── route.ts
│       │   ├── dashboard/
│       │   │   └── page.tsx
│       │   ├── error.tsx
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── loading.tsx
│       │   ├── not-found.tsx
│       │   └── page.tsx
│       ├── components/
│       │   ├── layout/
│       │   └── ui/
│       ├── config/
│       ├── lib/
│       ├── tests/
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── ui/
│   ├── utils/
│   └── config/
│
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
├── turbo.json
├── tsconfig.base.json
└── README.md
```

## Why this architecture

The monorepo does not create an unnecessary Express backend beside Next.js.

Next.js already provides the application/server boundary through:

- Server Components
- Server Actions
- Route Handlers
- Middleware/proxy patterns
- Server-side modules

A separate API service should be introduced only when the project has a real reason for one, such as independent deployment, multiple non-web consumers, or a separately scaled backend.

## Workspace packages

### `@cwad/types`

Shared TypeScript contracts.

### `@cwad/validation`

Shared Zod schemas and validation primitives.

### `@cwad/ui`

Reusable UI primitives that can be shared by multiple applications.

### `@cwad/utils`

Framework-independent utilities.

### `@cwad/config`

Reserved shared configuration workspace.

## Requirements

- Node.js 20.9+
- npm 10+

## Install

From the repository root:

```bash
npm install
```

## Development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Routes

```text
/
├── /dashboard
└── /api/health
```

## Health endpoint

```http
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "service": "web",
  "timestamp": "..."
}
```

## Quality

```bash
npm run typecheck
npm run lint
npm run test
npm run format:check
```

## Production

Build:

```bash
npm run build
```

Start:

```bash
npm run start
```

## Environment

Application environment configuration lives in:

```text
apps/web/.env.example
```

Copy it to:

```text
apps/web/.env
```

Public browser variables must use the `NEXT_PUBLIC_` prefix.

Do not place secrets in `NEXT_PUBLIC_*` variables.

## Data and backend capabilities

The base template intentionally does not force:

- Prisma
- PostgreSQL
- Redis
- BullMQ
- Authentication provider
- S3
- Stripe
- Email provider

Those should be added by CWAD capability modules when selected.

For example:

```text
Next.js Monorepo
      |
      +-- PostgreSQL + Prisma
      +-- Authentication
      +-- Redis
      +-- Queue
      +-- Object Storage
      +-- Payments
```

This prevents every generated project from carrying infrastructure it does not need.

## Testing

Vitest is included for unit/component-oriented tests.

```bash
npm run test
```

Add Playwright when the generated project requires browser-level end-to-end testing.

## CI

The included GitHub Actions workflow runs:

1. Dependency installation
2. Type checking
3. Linting
4. Tests
5. Production build

## Security principles

The base application follows these rules:

- Server-only modules are separated from browser modules.
- Secrets are not exposed through public environment variables.
- Route handlers validate request input.
- Response contracts are typed.
- Error boundaries prevent uncaught UI failures from breaking the application shell.
- Authentication and authorization are capability modules rather than fake boilerplate.

## Scaling the template

For larger applications, organize business domains under:

```text
apps/web/
├── app/
├── features/
│   ├── users/
│   ├── billing/
│   ├── projects/
│   └── ...
├── components/
└── lib/
```

Do not turn `components/` or `lib/` into dumping grounds.

Keep domain-specific code close to its domain.

## Official references

- Next.js: https://nextjs.org/docs
- Turborepo: https://turborepo.dev/docs
- React: https://react.dev/
