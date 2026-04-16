from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .models import TruckStatus, JobStatus

# Truck schemas
class TruckBase(BaseModel):
    registration_number: str
    capacity: int

class TruckCreate(TruckBase):
    pass

class TruckUpdate(BaseModel):
    registration_number: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[TruckStatus] = None

class TruckResponse(TruckBase):
    id: int
    status: TruckStatus
    class Config:
        from_attributes = True

# Driver schemas
class DriverBase(BaseModel):
    name: str
    license_number: str
    phone_number: str

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    phone_number: Optional[str] = None

class DriverResponse(DriverBase):
    id: int
    is_active: int
    class Config:
        from_attributes = True

# Job schemas
class JobBase(BaseModel):
    pickup_location: str
    delivery_location: str
    cargo_description: str
    truck_id: int
    driver_id: int

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None
    cargo_description: Optional[str] = None
    status: Optional[JobStatus] = None
    truck_id: Optional[int] = None
    driver_id: Optional[int] = None

class JobResponse(JobBase):
    id: int
    status: JobStatus
    created_at: datetime
    class Config:
        from_attributes = True