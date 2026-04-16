import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_success():
    response = client.post("/auth/token", json={
        "username": "admin",
        "password": "admin"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_failure_wrong_password():
    response = client.post("/auth/token", json={
        "username": "admin",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_login_failure_wrong_username():
    response = client.post("/auth/token", json={
        "username": "wronguser",
        "password": "admin"
    })
    assert response.status_code == 401

def test_login_failure_missing_fields():
    response = client.post("/auth/token", json={
        "username": "admin"
    })
    assert response.status_code == 422

def test_protected_endpoint_without_token():
    response = client.get("/trucks/")
    # FastAPI's HTTPBearer returns 403 when no credentials
    assert response.status_code == 403

def test_protected_endpoint_with_invalid_token():
    response = client.get("/trucks/", headers={"Authorization": "Bearer invalid-token"})
    assert response.status_code == 403
