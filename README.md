cat > README.md << 'EOF'
# Haulage Truck Management System

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A production-ready **full-stack fleet management system** for tracking trucks, drivers, and delivery jobs with intelligent business rule enforcement.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Business Rules](#business-rules)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

The **Haulage Truck Management System** is an enterprise-grade solution for logistics companies to manage their fleet operations efficiently. It provides complete CRUD operations for trucks, drivers, and delivery jobs while enforcing critical business rules automatically.

### Key Capabilities

- **Fleet Management**: Track truck status, capacity, and availability
- **Driver Management**: Maintain driver roster with license and contact information
- **Job Management**: Create, assign, and track delivery jobs from pickup to completion
- **Smart Assignment**: Automatically prevents assignment of unavailable trucks or busy drivers
- **Real-time Dashboard**: Visual analytics with fleet and job status charts

## Features

### Core Features
-  **Truck Management** - Register, update, view, and delete trucks with status tracking
-  **Driver Management** - Create, update, view, and delete drivers with availability status
-  **Job Management** - Create delivery jobs, assign trucks/drivers, track status, complete jobs
-  **Business Rules** - Automatic enforcement of truck/driver availability rules
-  **REST API** - Complete CRUD operations with proper HTTP methods and status codes

### Bonus Features
-  **JWT Authentication** - Secure API access with token-based authentication
-  **Interactive Dashboard** - Real-time statistics and charts
-  **Responsive UI** - Modern, whitespace design that works on all devices
-  **Pagination** - Efficient data loading for large datasets
-  **Logging** - Comprehensive request/error logging to file and console
-  **Unit Tests** - Extensive test coverage for all business logic
-  **Docker Support** - One-command deployment with docker-compose

##  Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Backend** | FastAPI | 0.104+ |
| **Database** | PostgreSQL | 15 |
| **ORM** | SQLAlchemy | 2.0+ |
| **Frontend** | HTML5/CSS3/JavaScript | - |
| **CSS Framework** | TailwindCSS | 3.4+ |
| **Charts** | Chart.js | 4.4+ |
| **Icons** | Remix Icon | 4.0+ |
| **Authentication** | JWT (python-jose) | 3.3+ |
| **Container** | Docker & Docker Compose | latest |
| **Testing** | pytest | 7.4+ |

##  Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TafadzwaLawrence/Haulage-Truck-Management-System-Solution.git
   cd haulage-management


2. **Run with Docker Compose**
   ```bash
   docker-compose up 
   ```

3. **Access the application**
   - Frontend UI: http://localhost:8000
   - API Documentation (Swagger): http://localhost:8000/docs

4. **Default Admin User**
   - Username: `admin`
   - Password: `admin`


## Testing Guide

### Test Overview

The application includes **18 comprehensive tests** covering all core functionality, business rules, and edge cases. All tests pass with 100% success rate.

| Test Category | Number of Tests | Status |
|---------------|----------------|--------|
| Truck Management | 8 tests | ✅ Passing |
| Driver Management | 5 tests | ✅ Passing |
| Job Management | 5 tests | ✅ Passing |
| **Total** | **18 tests** | **✅ 100% Pass Rate** |

### What's Tested

#### Truck Tests ✓
- Create truck with valid data
- Create truck without authentication (returns 403)
- Retrieve all trucks with pagination
- Retrieve single truck by ID
- Handle non-existent truck (404)
- Update truck details and status
- Delete truck with confirmation
- Pagination functionality (skip/limit)

#### Driver Tests ✓
- Create driver with valid information
- Retrieve all drivers
- Retrieve single driver by ID
- Update driver information
- Delete driver from system

#### Job Tests ✓
- Create job with available truck and driver
- Business rule: Cannot assign truck in transit/under maintenance
- Business rule: Cannot assign driver with active job
- Update job status to completed
- Delete job automatically frees truck and driver

### Running Tests

#### Method 1: Using Docker (Recommended)

```bash
# Run all tests
sudo docker compose exec api python -m pytest app/tests/ -v

# Run specific test file
sudo docker compose exec api python -m pytest app/tests/test_trucks.py -v
sudo docker compose exec api python -m pytest app/tests/test_drivers.py -v
sudo docker compose exec api python -m pytest app/tests/test_jobs.py -v

# Run with detailed output
sudo docker compose exec api python -m pytest app/tests/ -v --tb=short

# Run with test coverage report
sudo docker compose exec api pip install pytest-cov
sudo docker compose exec api python -m pytest app/tests/ -v --cov=app --cov-report=term