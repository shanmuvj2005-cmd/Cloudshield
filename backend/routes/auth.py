from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
from backend.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    return {
        "username": username,
        "role": payload.get("role", "admin"),
        "full_name": "SOC Administrator",
        "email": "admin@cloudshield.sec"
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    if (
        credentials.username == settings.DEMO_ADMIN_USERNAME and 
        credentials.password == settings.DEMO_ADMIN_PASSWORD
    ):
        access_token = create_access_token(
            data={"sub": credentials.username, "role": "admin"}
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "username": credentials.username,
                "role": "admin",
                "full_name": "SOC Administrator",
                "email": "admin@cloudshield.sec"
            }
        }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. Use demo login: admin / cloudshield2026"
    )

@router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user
