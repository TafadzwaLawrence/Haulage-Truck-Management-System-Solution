from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from ..dependencies import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

class LoginRequest(BaseModel):
    username: str
    password: str

# Simple demo user - in production, use database
DEMO_USER = {"username": "admin", "password": "admin"}

@router.post("/token")
def login(login_data: LoginRequest):
    if login_data.username == DEMO_USER["username"] and login_data.password == DEMO_USER["password"]:
        token = create_access_token({"sub": login_data.username})
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )