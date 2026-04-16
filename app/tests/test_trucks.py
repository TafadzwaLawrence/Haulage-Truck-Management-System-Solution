import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models import Truck, TruckStatus

# Test database
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

# Get auth token first
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

def test_create_truck(auth_headers):
    response = client.post("/trucks/", json={
        "registration_number": "TEST123",
        "capacity": 10000
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["registration_number"] == "TEST123"
    assert data["capacity"] == 10000
    assert data["status"] == "available"

def test_create_truck_without_auth():
    response = client.post("/trucks/", json={
        "registration_number": "TEST123",
        "capacity": 10000
    })
    assert response.status_code == 401

def test_get_trucks(auth_headers):
    # Create two trucks
    client.post("/trucks/", json={"registration_number": "TRUCK1", "capacity": 5000}, headers=auth_headers)
    client.post("/trucks/", json={"registration_number": "TRUCK2", "capacity": 6000}, headers=auth_headers)
    
    response = client.get("/trucks/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_get_single_truck(auth_headers):
    create_response = client.post("/trucks/", json={
        "registration_number": "SINGLE123",
        "capacity": 7000
    }, headers=auth_headers)
    truck_id = create_response.json()["id"]
    
    response = client.get(f"/trucks/{truck_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["registration_number"] == "SINGLE123"

def test_get_nonexistent_truck(auth_headers):
    response = client.get("/trucks/9999", headers=auth_headers)
    assert response.status_code == 404

def test_update_truck(auth_headers):
    create_response = client.post("/trucks/", json={
        "registration_number": "UPDATE123",
        "capacity": 8000
    }, headers=auth_headers)
    truck_id = create_response.json()["id"]
    
    response = client.put(f"/trucks/{truck_id}", json={
        "capacity": 9000,
        "status": "under_maintenance"
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["capacity"] == 9000
    assert response.json()["status"] == "under_maintenance"

def test_delete_truck(auth_headers):
    create_response = client.post("/trucks/", json={
        "registration_number": "DELETE123",
        "capacity": 1000
    }, headers=auth_headers)
    truck_id = create_response.json()["id"]
    
    response = client.delete(f"/trucks/{truck_id}", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify deleted
    get_response = client.get(f"/trucks/{truck_id}", headers=auth_headers)
    assert get_response.status_code == 404

def test_pagination(auth_headers):
    # Create 15 trucks
    for i in range(15):
        client.post("/trucks/", json={
            "registration_number": f"PAG{i}",
            "capacity": 1000 + i
        }, headers=auth_headers)
    
    response = client.get("/trucks/?skip=0&limit=10", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 10
    
    response = client.get("/trucks/?skip=10&limit=10", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 5