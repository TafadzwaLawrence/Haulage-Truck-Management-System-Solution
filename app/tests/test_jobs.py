import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

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

def test_create_job_with_unavailable_truck(auth_headers, test_truck, test_driver):
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

def test_create_job_with_busy_driver(auth_headers, test_truck, test_driver):
    client.post("/jobs/", json={
        "pickup_location": "Location 1",
        "delivery_location": "Location 2",
        "cargo_description": "Cargo 1",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    
    truck2 = client.post("/trucks/", json={
        "registration_number": "TRUCK2",
        "capacity": 6000
    }, headers=auth_headers).json()
    
    response = client.post("/jobs/", json={
        "pickup_location": "Location 3",
        "delivery_location": "Location 4",
        "cargo_description": "Cargo 2",
        "truck_id": truck2["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    assert response.status_code == 400
    assert "Driver already has an active job" in response.json()["detail"]

def test_update_job_to_completed(auth_headers, test_truck, test_driver):
    job_response = client.post("/jobs/", json={
        "pickup_location": "Start",
        "delivery_location": "End",
        "cargo_description": "Test Cargo",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    job_id = job_response.json()["id"]
    
    response = client.put(f"/jobs/{job_id}", json={
        "status": "completed"
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "completed"

def test_delete_job_frees_resources(auth_headers, test_truck, test_driver):
    job_response = client.post("/jobs/", json={
        "pickup_location": "Start",
        "delivery_location": "End",
        "cargo_description": "Test Cargo",
        "truck_id": test_truck["id"],
        "driver_id": test_driver["id"]
    }, headers=auth_headers)
    job_id = job_response.json()["id"]
    
    response = client.delete(f"/jobs/{job_id}", headers=auth_headers)
    assert response.status_code == 200
    
    truck_response = client.get(f"/trucks/{test_truck['id']}", headers=auth_headers)
    assert truck_response.json()["status"] == "available"