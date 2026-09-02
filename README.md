# YatraSetu Backend Starter

Prepared to match the current YatraSetu architecture:
Frontend → Express API → Prisma → SQLite.

## What is included
- Prisma + SQLite schema
- Express REST API
- JWT authentication
- Role field enforced by backend data
- NIDHI accommodation importer
- Location filtering for `/api/homestays?city=...`
- Guide model + import template
- Booking requests
- Cleanliness reports
- Crowd records
- Emergency alerts/requests (emergency requests are explicitly simulated)
- Basic notifications model
- REST chat data model

## Important data rule
NIDHI accommodation records are imported with `isYatraSetuProvider=false`.
Do not show instant YatraSetu booking for NIDHI directory listings unless the provider is actually onboarded.

## Local setup
1. Copy `.env.example` to `.env`.
2. Put the cleaned CSV at `data/YatraSetu_Homestays_Cleaned.csv`.
3. Run:
   npm.cmd install
   npm.cmd run prisma:generate
   npm.cmd run prisma:migrate
   npm.cmd run import:nidhi
   npm.cmd run dev

API: http://localhost:4000
Health check: http://localhost:4000/api/health

## Guide data
`data/guide_import_template.csv` is intentionally a template because no authoritative guide dataset was available in the supplied project files. Do not fabricate guide records.

## Frontend integration
Replace mock fetches in the existing UserLocalConnect/Homestays/Guides flows with API calls. Keep the existing hash routing and UX.
