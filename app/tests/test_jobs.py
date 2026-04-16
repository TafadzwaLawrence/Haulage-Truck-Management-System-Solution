import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models import TruckStatus, JobStatus

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def get_auth_token():
    response = client.post("/auth/token", json={"username": "admin", "password": "admin"})
    return response.json()["access_token"]

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def auth_headers():
    token = get_auth_token()
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def test_truck(auth_headers):
    response = client.post("/trucks/", json={
        "registration_number": "JOBTRUCK",
        "capacity": 5000
    }, headers=auth_headers)
    return response.json()

@pytest.fixture
def test_driver(auth_headers):
    response = client.post("/drivers/", json={
        "name": "Job Driver",
        "license_number": "JOBLIC",
        "phone_number": "+1234567890"
    }, headers=auth_headers)
    return response.json()

# Test Create Job
def test_create_job(auth_headers, test_truck, test_driver):
    response = client.post("/jobs/", json={
        "pickup_location": "Warehouse A",
        "delivery_location": "Store B",
        "cargo_description": "Electronics",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["pickup_location"] == "Warehouse A"
    assert data["delivery_location"] == "Store B"
    assert data["status"] == "pending"

# Test Create Job Without Auth
def test_create_job_without_auth(test_truck, test_driver):
    response = client.post("/jobs/", json={
        "pickup_location": "Warehouse A",
        "delivery_location": "Store B",
        "cargo_description": "Electronics",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    })
    assert response.status_code == 401

# Test Create Job With Unavailable Truck
def test_create_job_with_unavailable_truck(auth_headers, test_truck, test_driver):
    # First mark truck as under maintenance
    client.put(f"/trucks/{test_truck['id']}", json={
        "status": "under_maintenance"
    }, headers=auth_headers)
    
    response = client.post("/jobs/", json={
        "pickup_location": "Warehouse A",
        "delivery_location": "Store B",
        "cargo_description": "Electronics",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    assert response.status_code == 400
    assert "Truck not available" in response.json()["detail"]

# Test Create Job With Busy Driver
def test_create_job_with_busy_driver(auth_headers, test_truck, test_driver):
    # Create first job
    client.post("/jobs/", json={
        "pickup_location": "Location 1",
        "delivery_location": "Location 2",
        "cargo_description": "Cargo 1",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    
    # Create second truck for second job
    truck2 = client.post("/trucks/", json={
        "registration_number": "TRUCK2",
        "capacity": 6000
    }, headers=auth_headers).json()
    
    # Try to create second job with same driver
    response = client.post("/jobs/", json={
        "pickup_location": "Location 3",
        "delivery_location": "Location 4",
        "cargo_description": "Cargo 2",
        "truck_id": truck2["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    assert response.status_code == 400
    assert "Driver already has an active job" in response.json()["detail"]

# Test Get All Jobs
def test_get_jobs(auth_headers, test_truck, test_driver):
    client.post("/jobs/", json={
        "pickup_location": "Job 1",
        "delivery_location": "Dest 1",
        "cargo_description": "Cargo 1",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    
    response = client.get("/jobs/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

# Test Get Single Job
def test_get_single_job(auth_headers, test_truck, test_driver):
    create_response = client.post("/jobs/", json={
        "pickup_location": "Start",
        "delivery_location": "End",
        "cargo_description": "Test Cargo",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    job_id = create_response.json()["id"]
    
    response = client.get(f"/jobs/{job_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["cargo_description"] == "Test Cargo"

# Test Update Job Status to Completed
def test_update_job_to_completed(auth_headers, test_truck, test_driver):
    # Create job
    job_response = client.post("/jobs/", json={
        "pickup_location": "Start",
        "delivery_location": "End",
        "cargo_description": "Test Cargo",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    job_id = job_response.json()["id"]
    
    # Update job to completed
    response = client.put(f"/jobs/{job_id}", json={
        "status": "completed"
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    
    # Verify truck is now available
    truck_response = client.get(f"/trucks/{test_truck['id']}", headers=auth_headers)
    assert truck_response.json()["status"] == "available"

# Test Delete Job Frees Resources
def test_delete_job_frees_resources(auth_headers, test_truck, test_driver):
    # Create job
    job_response = client.post("/jobs/", json={
        "pickup_location": "Start",
        "delivery_location": "End",
        "cargo_description": "Test Cargo",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    job_id = job_response.json()["id"]
    
    # Delete job
    response = client.delete(f"/jobs/{job_id}", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify truck is available again
    truck_response = client.get(f"/trucks/{test_truck['id']}", headers=auth_headers)
    assert truck_response.json()["status"] == "available"

# Test Pagination for Jobs
def test_job_pagination(auth_headers, test_truck, test_driver):
    for i in range(15):
        client.post("/jobs/", json={
            "pickup_location": f"Pickup {i}",
            "delivery_location": f"Delivery {i}",
            "cargo_description": f"Cargo {i}",
            "truck_id": test_truck["id"],
            "driver_id": test_driver["id"]
        }, headers=auth_headers)
    
    response = client.get("/jobs/?skip=0&limit=10", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 10
    
    response = client.get("/jobs/?skip=10&limit=10", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 5

# Test Invalid Job Creation (Missing Fields)
def test_invalid_job_creation(auth_headers):
    response = client.post("/jobs/", json={
        "pickup_location": "Only Pickup",
        "delivery_location": "",
        "cargo_description": "",
        "truck_id": 1,
        "driver_id": 1
    }, headers=auth_headers)
    assert response.status_code == 422
