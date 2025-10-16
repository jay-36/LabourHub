# LabourHub — Local Labour Hiring Website

A light-weight Node.js project for a labour hiring platform (employers post jobs, workers apply). This repository contains a simple Express server, public static frontend files, route handlers, and a local SQLite database initializer.

This README covers how to run the project locally, where key files live, and a few important notes and recommendations.

## Quick status
- Server: simple Express static server (serves `public/`)
- Database: repository includes `database.js` which creates/initializes a local SQLite database file (`labour-hiring-complete.db`) with sample data
- Frontend: static HTML/JS files under `public/`

## Requirements
- Node.js 16+ (tested with Node 18/20)
- npm (or yarn)

## Install

Open a terminal in the project root and run:

```powershell
cd C:\Users\Jay\Desktop\labour-hiring-website
npm install
```

Note: `node_modules` is gitignored. If you see a large node_modules locally, it's normal after npm install.

## Run (development)

Start the server:

```powershell
npm run dev
# or
node app.js
```

The server serves the static frontend from `public/` on port 5000 by default. You can open:
- http://localhost:5000
- http://localhost:5000/api/test  (a simple JSON test endpoint)

## Database
- The project contains `database.js` which uses `sqlite3` and initializes a file `labour-hiring-complete.db` in the repository root.
- Running the project will (in the current setup) create tables and insert sample data. See `database.js` for the full schema and sample rows.

Important: There is an inconsistency in the repository: `models/User.js` uses Mongoose (MongoDB), while `database.js` uses SQLite. The running server and included dependencies (see `package.json`) show SQLite is the intended DB for the current setup. If you plan to use MongoDB, adjust dependencies and the initialization code accordingly.

## Project structure (high level)

- `app.js`, `server.js`, `database.js` — main server and DB initializer
- `models/` — Mongoose-style models (note: inconsistent with the SQLite DB)
- `routes/` — Express route handlers for auth and jobs
- `public/` — frontend HTML/CSS/JS (index, dashboards)
- `package.json` — Node dependencies and start scripts

## Notes & troubleshooting

- If you get errors about missing modules, run `npm install`.
- If you want Git commits to use your real name/email, configure git globally:

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

- Database choices:
  - To stick with SQLite (current repository): continue using `database.js` and ensure `sqlite3` is installed (it's in `package.json`). Remove Mongoose files or keep them for a future Mongo migration.
  - To switch to MongoDB: install `mongoose` and update `database.js` or `app.js` to connect to MongoDB, remove SQLite initializer, and update `package.json`.

## Recommended next steps
1. Decide on a single database (SQLite or MongoDB) and make the models + initializer consistent.
2. Add a `README` section with API docs for existing routes (`/api/...`) if you plan to extend the backend.
3. Add a `.env` for configuration (PORT, DB path/URL) and load it with `dotenv`.
4. Add a basic `README` usage section with sample API calls (curl or fetch) and screenshots of the UI.

## Contributing
If you want me to: I can (pick one or more):
- unify DB usage (convert Mongoose -> SQLite or vice versa)
- add environment config and instructions
- create API documentation and examples
- add a GitHub Actions workflow for linting or tests

---
If you want any of the recommended follow-ups, tell me which and I’ll implement them.
