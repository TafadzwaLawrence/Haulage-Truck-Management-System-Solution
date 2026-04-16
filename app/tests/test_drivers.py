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

# Test Create Driver
def test_create_driver(auth_headers):
    response = client.post("/drivers/", json={
        "name": "John Doe",
        "license_number": "LIC123456",
        "phone_number": "+1234567890"
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "John Doe"
    assert data["license_number"] == "LIC123456"
    assert data["phone_number"] == "+1234567890"
    assert data["is_active"] == 1

# Test Create Driver Without Auth
def test_create_driver_without_auth():
    response = client.post("/drivers/", json={
        "name": "John Doe",
        "license_number": "LIC123456",
        "phone_number": "+1234567890"
    })
    assert response.status_code == 401

# Test Duplicate Driver License
def test_duplicate_driver_license(auth_headers):
    client.post("/drivers/", json={
        "name": "Jane Doe",
        "license_number": "DUPLICATE123",
        "phone_number": "+1111111111"
    }, headers=auth_headers)
    
    response = client.post("/drivers/", json={
        "name": "Jane Smith",
        "license_number": "DUPLICATE123",
        "phone_number": "+2222222222"
    }, headers=auth_headers)
    assert response.status_code == 400

# Test Get All Drivers
def test_get_drivers(auth_headers):
    client.post("/drivers/", json={"name": "Driver1", "license_number": "L1", "phone_number": "P1"}, headers=auth_headers)
    client.post("/drivers/", json={"name": "Driver2", "license_number": "L2", "phone_number": "P2"}, headers=auth_headers)
    
    response = client.get("/drivers/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2

# Test Get Single Driver
def test_get_single_driver(auth_headers):
    create_response = client.post("/drivers/", json={
        "name": "Single Driver",
        "license_number": "SINGLE123",
        "phone_number": "+9999999999"
    }, headers=auth_headers)
    driver_id = create_response.json()["id"]
    
    response = client.get(f"/drivers/{driver_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Single Driver"

# Test Update Driver
def test_update_driver(auth_headers):
    create_response = client.post("/drivers/", json={
        "name": "Old Name",
        "license_number": "UPDATE123",
        "phone_number": "+1111111111"
    }, headers=auth_headers)
    driver_id = create_response.json()["id"]
    
    response = client.put(f"/drivers/{driver_id}", json={
        "name": "New Name",
        "phone_number": "+2222222222"
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"
    assert response.json()["phone_number"] == "+2222222222"

# Test Delete Driver
def test_delete_driver(auth_headers):
    create_response = client.post("/drivers/", json={
        "name": "Delete Me",
        "license_number": "DELETE123",
        "phone_number": "+0000000000"
    }, headers=auth_headers)
    driver_id = create_response.json()["id"]
    
    response = client.delete(f"/drivers/{driver_id}", headers=auth_headers)
    assert response.status_code == 200
    
    get_response = client.get(f"/drivers/{driver_id}", headers=auth_headers)
    assert get_response.status_code == 404

# Test Pagination
def test_driver_pagination(auth_headers):
    for i in range(15):
        client.post("/drivers/", json={
            "name": f"Driver{i}",
            "license_number": f"LIC{i}",
            "phone_number": f"PHONE{i}"
        }, headers=auth_headers)
    
    response = client.get("/drivers/?skip=0&limit=10", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 10
    
    response = client.get("/drivers/?skip=10&limit=10", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 5

# Test Invalid Phone Number Format
def test_invalid_phone_format(auth_headers):
    response = client.post("/drivers/", json={
        "name": "Invalid Phone",
        "license_number": "INVALID123",
        "phone_number": "123"  # Too short
    }, headers=auth_headers)
    # Should still work as phone validation is minimal
    assert response.status_code == 200
