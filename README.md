# DeskFlow — Support Ticket Triage Board

A full-stack support ticket management app built with the MERN stack. Support agents can view tickets in a kanban-style board grouped by status, move them between stages, and see which ones are breaching SLA.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas

## Features

- Create tickets with subject, description, email, and priority
- Board view grouped by status: Open → In Progress → Resolved → Closed
- Strict status transition rules enforced on backend
- SLA breach detection based on priority-based response time targets
- Age tracking — stops growing once a ticket is resolved
- Drag-and-drop between columns (with snap-back on invalid moves)
- Filters by priority and SLA breach
- Stats strip showing counts per status and total breached open tickets

## SLA Targets

| Priority | Target |
|----------|--------|
| Urgent   | 1 hour |
| High     | 4 hours |
| Medium   | 24 hours |
| Low      | 72 hours |

## Setup (Local)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# add your MongoDB Atlas connection string in .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# set VITE_API_URL=http://localhost:5000 in .env
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /tickets | Create a ticket |
| GET | /tickets | List tickets (supports ?status, ?priority, ?breached=true) |
| PATCH | /tickets/:id | Update ticket status |
| DELETE | /tickets/:id | Delete a ticket |
| GET | /tickets/stats | Aggregate counts |

### Example — Create Ticket

```bash
POST /tickets
{
  "subject": "Login not working",
  "description": "Users can't log in since this morning",
  "customerEmail": "user@example.com",
  "priority": "high"
}
```

### Example — Ticket Response

```json
{
  "_id": "65f...",
  "subject": "Login not working",
  "priority": "high",
  "status": "in_progress",
  "createdAt": "2026-05-20T08:00:00.000Z",
  "ageMinutes": 312,
  "slaBreached": true
}
```

## Deployment

- **Frontend**: Netlify
- **Backend**: Render (connect GitHub repo, add `MONGODB_URI` and `FRONTEND_URL` env vars)
- **Database**: MongoDB Atlas free tier
