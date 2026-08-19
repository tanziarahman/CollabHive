# CollabHive

CollabHive is a platform for finding collaborators for any kind of project — software, hardware, research, business, design, hackathons, and more. Post what you're building, describe the roles and skills you need, and let skill-based matching connect you with the right people.

## Features

- **Post any project** — not limited to software; supports any discipline, with required skills, tech stack, open roles, and a status (Active, On Hold, Completed).
- **Skill-matched recommendations** — for project owners looking for collaborators, and for browsers looking for projects that fit their own skills. Matches are explainable: you see exactly which skills matched, not just a score.
- **Similar projects** — every project page surfaces related projects using the same matching logic.
- **Comments and Q&A** — ask a project owner a question before applying.
- **Follow system** — follow other builders, see their new projects in your feed, and get notified.
- **Join requests and invites** — apply to a role, or have a project owner invite you directly.
- **Group chat** — real-time chat for each project's team, once you're on one.
- **Profile and resume** — showcase your skills, interests, and past projects; generate a resume PDF.

## Tech stack

- **Frontend**: React (Vite), React Router, Axios, Socket.IO client
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO
- **Auth**: JWT, bcrypt

## Project structure

```
CollabHive/
  client/   React frontend (Vite)
  server/   Express API + Socket.IO server
```

## Getting started

### Prerequisites

- Node.js 18 or later
- A MongoDB connection string (local or Atlas)

### Server setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` with:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Run the server:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

### Client setup

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` by default and talks to the API at `http://localhost:5000`. To point it at a different API host, set `VITE_API_URL` in a `.env` file inside `client/`.

## Scripts

**Server** (`server/package.json`)
- `npm run dev` — start the API with nodemon (auto-restart on changes)
- `npm start` — start the API normally

**Client** (`client/package.json`)
- `npm run dev` — start the Vite dev server
- `npm run build` — build for production
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
