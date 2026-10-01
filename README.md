# Agent Skills

A web application for creating, managing and sharing `SKILL.md` files for AI coding agents.

Write skills in the browser, keep them private while you refine them, publish the useful ones to a public gallery, and copy or download any skill when you need it.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Live demo:** [agent-skills-manager-murex.vercel.app](https://agent-skills-manager-murex.vercel.app)

## Contents

- [What is a skill?](#what-is-a-skill)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Rendering strategies](#rendering-strategies)
- [Getting started](#getting-started)
- [Database](#database)
- [Temporal polyfill](#temporal-polyfill)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [API and server actions](#api-and-server-actions)
- [Security](#security)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Credits](#credits)
- [License](#license)


## What is a skill?

A skill is a folder containing a `SKILL.md` file. The file starts with a name and a short description, followed by plain-markdown instructions that an AI coding agent can load when a task calls for them.

```markdown
---
name: commit-message-writer
description: Writes clear commit messages from a staged diff.
---

# Commit message writer

When asked for a commit message:

1. Read the staged diff, not the whole repo.
2. Start with a short summary line in the imperative.
3. Add a body only if the "why" isn't obvious.
```

## Features

**Accounts**
- Register, log in and log out
- Signed, `httpOnly` cookie sessions with automatic expiry
- Passwords hashed with bcrypt

**Skill management**
- Create, edit and delete your own skills in markdown
- Public or private visibility for each skill
- Server-side validation and ownership checks

**Public gallery**
- Browse every public skill
- Search by name, description or author, and sort the results
- A page for each public skill

**Skill tools**
- Preview a skill in a dialog
- Copy a skill to the clipboard
- Download a skill as a `.md` file

**Dashboard**
- All your skills in one place
- Filter by All, Public or Private, and search your skills
- Create and edit from the same screen

**Interface**
- Dark and light themes, with the choice remembered
- Responsive layout
- Custom Tailwind CSS and DaisyUI styling

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, DaisyUI 5 (custom theme in `app/globals.css`) |
| Fonts | Archivo and JetBrains Mono, via `next/font` |
| Database | PostgreSQL, hosted on Neon |
| ORM | Prisma ORM 8 (release candidate), using a generated contract |
| Authentication | HMAC-signed cookie sessions |
| Password hashing | bcryptjs |
| Date and time | Temporal, through a polyfill |
| Hosting | Vercel |

## Rendering strategies

The app combines static generation with server rendering on demand.

| Route | Strategy |
|---|---|
| `/` | Static |
| `/about` | Static |
| `/login`, `/register` | Static shell, forms run on the client |
| `/dashboard` | Static shell, authentication and data load on the client |
| `/dashboard/skills/new` | Static shell, client-side form |
| `/dashboard/skills/[id]/edit` | Dynamic |
| `/skills` | Static with ISR, revalidates every 60 seconds |
| `/skills/[id]` | Dynamic |
| `/api/*` | Dynamic server endpoints |

The `/skills` gallery revalidates every 60 seconds, and saving or deleting a skill also revalidates it, so new skills show up without a rebuild. Because the gallery reads the database at build time, `DATABASE_URL` must be set when you build.

## Getting started

### Prerequisites

- Node.js 20.9 or newer, and npm
- PostgreSQL 15 or newer (a free [Neon](https://neon.tech) project works well, or use the Docker setup below)

### 1. Clone and install

```bash
git clone https://github.com/Sana-145/agent-skills-manager.git
cd agent-skills-manager
npm install
```

### 2. Choose a database

**Option A: Neon (hosted).** Create a project and copy two connection strings from the dashboard: the pooled one and the direct one.

**Option B: local Postgres with Docker.** The repository includes a `docker-compose.yml` that starts PostgreSQL 16:

```bash
docker compose up -d
```

It creates a database named `skills_db` on port 5432 with the user and password `postgres`, so the connection string is:

```text
postgresql://postgres:postgres@localhost:5432/skills_db
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Connection used by the running application (Neon: the pooled string)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"

# Connection used by Prisma CLI commands (Neon: the direct string)
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"

# Secret used to sign login cookies. At least 32 characters.
AUTH_SECRET="paste-a-long-random-value-here"

# Optional: how long a login lasts, in hours (default: 24)
AUTH_TOKEN_EXPIRY_HOURS="24"
```

With a local database, `DATABASE_URL` and `DIRECT_URL` can be the same string.

Generate an `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Never commit `.env`. If `AUTH_SECRET` is missing or shorter than 32 characters, login and registration fail with a clear error in the server log.

### 4. Create the tables

```bash
npx prisma db init
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To try a production build locally, run `npm run build` and then `npm run start`.

## Database

The project uses Prisma ORM 8, which is currently a release candidate, with a PostgreSQL contract. The contract describes the data model and generates the typed client.

| File | Purpose |
|---|---|
| `prisma/contract.prisma` | The data model (edit this) |
| `prisma/contract.json` | Generated contract (commit it) |
| `prisma/contract.d.ts` | Generated types (commit it) |
| `prisma/db.ts` | The database client used by the app |
| `prisma.config.ts` | CLI configuration, reads `DIRECT_URL` |
| `migrations/` | Migration files and snapshots (commit them) |

Useful commands:

```bash
npx prisma db init             # create tables in the database
npx prisma migration status    # show migration status
npm run contract:emit          # regenerate contract.json and contract.d.ts
```

After you change `prisma/contract.prisma`, run `npm run contract:emit` and commit the regenerated files. Do not edit generated files by hand.

Because Prisma 8 is a release candidate, command names may change between releases. Run `npx prisma --help` to see what your installed version supports.

## Temporal polyfill

The PostgreSQL contract maps `timestamptz` columns, such as `createdAt` and `updatedAt`, to the Temporal API. Node.js does not provide a global `Temporal` yet, so without help the production build and server fail.

The app loads `@js-temporal/polyfill` from `instrumentation.ts` in the project root. Next.js runs that file once when the server starts, and it sets the global `Temporal` if it is missing. If you remove the polyfill or the instrumentation file, database reads that return timestamps will break.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run contract:emit` | Regenerate the Prisma contract files |

`npm install` also runs `prisma skills sync` automatically through the `postinstall` script, and an error there does not fail the install.

## Project structure

```text
app/
  layout.tsx            Root layout, fonts and theme script
  page.tsx              Landing page
  globals.css           Theme, colors and shared styles
  fonts.ts              Font setup
  about/                About page
  (auth)/               Login and register pages
  dashboard/            Your skills, plus the new and edit pages
  skills/               Public gallery and skill pages
  api/
    auth/               login, register, logout, me
    skills/             Your skills (list and single)
  actions/
    skills.ts           Server actions: create, update, delete
  components/           Header, Footer, SkillCard, SkillsExplorer, SkillActions, ThemeToggle
  hooks/
    useAuth.tsx         Auth context shared across the client
  lib/
    auth.ts             Password hashing, signed tokens, cookie helpers
    skill-utils.ts      Date formatting, slugs, copy and download helpers

prisma/                 Contract, generated files and database client
migrations/             Migration files and snapshots
public/                 Static assets
instrumentation.ts      Registers the Temporal polyfill at server start
prisma.config.ts        Prisma CLI configuration
docker-compose.yml      Local PostgreSQL for development
next.config.ts
package.json
```

## Data model

**User**

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `email` | Unique email address |
| `name` | Display name |
| `password` | bcrypt password hash |
| `createdAt`, `updatedAt` | Timestamps |

**Skill**

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `name` | Skill name |
| `description` | Short description |
| `content` | Markdown instructions |
| `isPublic` | Whether the skill appears in the public gallery (default `true`) |
| `authorId` | The owning user |
| `createdAt`, `updatedAt` | Timestamps |

A user has many skills. Deleting a user also deletes their skills, through the database foreign key.

## API and server actions

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/register` | POST | None | Create an account and log in |
| `/api/auth/login` | POST | None | Log in |
| `/api/auth/logout` | POST | None | Clear the session cookie |
| `/api/auth/me` | GET | Cookie | Return the current user |
| `/api/skills` | GET | Cookie | List your skills |
| `/api/skills/[id]` | GET | Cookie, owner only | Get one of your skills for editing |

Creating, updating and deleting skills use server actions in `app/actions/skills.ts`. They take the user from the signed session cookie and never trust a user ID sent by the browser.

## Security

- Login cookies are `httpOnly` and `sameSite=lax`, and `secure` in production.
- Tokens are signed with HMAC-SHA256 using `AUTH_SECRET`, checked with a constant-time comparison, and rejected if forged, tampered with or expired.
- Passwords are hashed with bcrypt.
- Server actions identify the user from the cookie, so a client cannot create, edit or delete skills as another user.
- Update and delete queries are scoped to the signed-in author.
- Skill name (100 characters), description (500) and content (100,000) are validated on the server, not only in the forms.
- Private skills are never returned to other users.

**Known limitations**
- There is no rate limiting on login yet.
- A token cannot be revoked before it expires (24 hours by default).
- Password strength is only checked in the browser, not on the server.

## Deployment

The app runs on [Vercel](https://vercel.com) with a Neon PostgreSQL database. Live site: [agent-skills-manager-murex.vercel.app](https://agent-skills-manager-murex.vercel.app).

1. Push the repository to GitHub. Make sure it includes `prisma/contract.prisma`, `prisma/contract.json`, `prisma/contract.d.ts` and `migrations/`, and does **not** include `.env`.
2. In Vercel, choose **Add New, Project** and import the repository.
3. Under **Environment Variables**, add:

   | Variable | Purpose |
   |---|---|
   | `DATABASE_URL` | Pooled connection used by the running app (required at build time too) |
   | `DIRECT_URL` | Direct connection used by Prisma CLI commands |
   | `AUTH_SECRET` | Random secret of at least 32 characters |
   | `AUTH_TOKEN_EXPIRY_HOURS` | Optional, defaults to 24 |

4. Deploy. After that, every push to `main` creates a new production deployment.
5. If you change an environment variable later, redeploy so the new value takes effect.

## Roadmap

- [ ] Tags and categories for skills
- [ ] Favorites
- [ ] Login rate limiting
- [ ] Server-side password rules
- [ ] Import a skill from a GitHub URL
