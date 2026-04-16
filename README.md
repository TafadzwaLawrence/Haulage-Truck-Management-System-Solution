# Haulage Truck Management System

## Requirements
- Docker & Docker Compose

## Setup
1. Clone repo
2. Copy `.env.example` to `.env` and adjust if needed
3. Run `docker compose up --build`
4. API available at `http://localhost:8000/docs`

## API Endpoints
- **Auth**: POST `/auth/token` (get JWT)
- **Trucks**: CRUD at `/trucks/`
- **Drivers**: CRUD at `/drivers/`
- **Jobs**: CRUD at `/jobs/` (business rules enforced)

## Business Rules
- Truck cannot be assigned if `in_transit` or `under_maintenance`
- Driver cannot have multiple active jobs
- Job completion/cancellation frees truck/driver

## Testing
```bash
docker compose run api pytest