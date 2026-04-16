from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum

class TruckStatus(str, enum.Enum):
    AVAILABLE = "available"
    IN_TRANSIT = "in_transit"
    UNDER_MAINTENANCE = "under_maintenance"

class JobStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Truck(Base):
    __tablename__ = "trucks"
    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True)
    capacity = Column(Integer)
    status = Column(Enum(TruckStatus), default=TruckStatus.AVAILABLE)
    jobs = relationship("Job", back_populates="truck")

class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    license_number = Column(String, unique=True)
    phone_number = Column(String)
    is_active = Column(Integer, default=1)  # 1 = free, 0 = on job
    jobs = relationship("Job", back_populates="driver")

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    pickup_location = Column(String)
    delivery_location = Column(String)
    cargo_description = Column(String)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING)
    truck_id = Column(Integer, ForeignKey("trucks.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    truck = relationship("Truck", back_populates="jobs")
    driver = relationship("Driver", back_populates="jobs")