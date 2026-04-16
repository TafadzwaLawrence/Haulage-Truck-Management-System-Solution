from sqlalchemy.orm import Session
from . import models, schemas

# Truck CRUD
def get_truck(db: Session, truck_id: int):
    return db.query(models.Truck).filter(models.Truck.id == truck_id).first()

def get_trucks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Truck).offset(skip).limit(limit).all()

def create_truck(db: Session, truck: schemas.TruckCreate):
    db_truck = models.Truck(**truck.model_dump())
    db.add(db_truck)
    db.commit()
    db.refresh(db_truck)
    return db_truck

def update_truck(db: Session, truck_id: int, truck_update: schemas.TruckUpdate):
    db_truck = get_truck(db, truck_id)
    if not db_truck:
        return None
    for key, value in truck_update.model_dump(exclude_unset=True).items():
        setattr(db_truck, key, value)
    db.commit()
    db.refresh(db_truck)
    return db_truck

def delete_truck(db: Session, truck_id: int):
    db_truck = get_truck(db, truck_id)
    if db_truck:
        db.delete(db_truck)
        db.commit()
        return True
    return False

# Driver CRUD
def get_driver(db: Session, driver_id: int):
    return db.query(models.Driver).filter(models.Driver.id == driver_id).first()

def get_drivers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Driver).offset(skip).limit(limit).all()

def create_driver(db: Session, driver: schemas.DriverCreate):
    db_driver = models.Driver(**driver.model_dump())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

def update_driver(db: Session, driver_id: int, driver_update: schemas.DriverUpdate):
    db_driver = get_driver(db, driver_id)
    if not db_driver:
        return None
    for key, value in driver_update.model_dump(exclude_unset=True).items():
        setattr(db_driver, key, value)
    db.commit()
    db.refresh(db_driver)
    return db_driver

def delete_driver(db: Session, driver_id: int):
    db_driver = get_driver(db, driver_id)
    if db_driver:
        db.delete(db_driver)
        db.commit()
        return True
    return False

# Job CRUD with business rules
def get_job(db: Session, job_id: int):
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def get_jobs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Job).offset(skip).limit(limit).all()

def create_job(db: Session, job: schemas.JobCreate):
    # Business rule: Truck cannot be assigned if in transit or under maintenance
    truck = db.query(models.Truck).filter(models.Truck.id == job.truck_id).first()
    if not truck or truck.status in [models.TruckStatus.IN_TRANSIT, models.TruckStatus.UNDER_MAINTENANCE]:
        raise ValueError("Truck not available for assignment")
    
    # Business rule: Driver cannot have multiple active jobs
    active_job = db.query(models.Job).filter(
        models.Job.driver_id == job.driver_id,
        models.Job.status.in_([models.JobStatus.PENDING, models.JobStatus.IN_PROGRESS])
    ).first()
    if active_job:
        raise ValueError("Driver already has an active job")
    
    db_job = models.Job(**job.model_dump())
    db.add(db_job)
    
    # Update truck status to in_transit
    truck.status = models.TruckStatus.IN_TRANSIT
    # Update driver active flag
    driver = db.query(models.Driver).filter(models.Driver.id == job.driver_id).first()
    if driver:
        driver.is_active = 0
    
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job(db: Session, job_id: int, job_update: schemas.JobUpdate):
    db_job = get_job(db, job_id)
    if not db_job:
        return None
    
    old_status = db_job.status
    for key, value in job_update.model_dump(exclude_unset=True).items():
        setattr(db_job, key, value)
    
    # If job becomes IN_PROGRESS, occupy truck and driver
    if job_update.status == models.JobStatus.IN_PROGRESS and old_status != models.JobStatus.IN_PROGRESS:
        truck = db.query(models.Truck).filter(models.Truck.id == db_job.truck_id).first()
        if truck:
            truck.status = models.TruckStatus.IN_TRANSIT
        driver = db.query(models.Driver).filter(models.Driver.id == db_job.driver_id).first()
        if driver:
            driver.is_active = 0
    
    # If job is COMPLETED or CANCELLED, free truck and driver
    if job_update.status in [models.JobStatus.COMPLETED, models.JobStatus.CANCELLED] and old_status not in [models.JobStatus.COMPLETED, models.JobStatus.CANCELLED]:
        truck = db.query(models.Truck).filter(models.Truck.id == db_job.truck_id).first()
        if truck:
            truck.status = models.TruckStatus.AVAILABLE
        driver = db.query(models.Driver).filter(models.Driver.id == db_job.driver_id).first()
        if driver:
            driver.is_active = 1
    
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: int):
    db_job = get_job(db, job_id)
    if db_job:
        # Free resources before deletion
        if db_job.status not in [models.JobStatus.COMPLETED, models.JobStatus.CANCELLED]:
            truck = db.query(models.Truck).filter(models.Truck.id == db_job.truck_id).first()
            if truck:
                truck.status = models.TruckStatus.AVAILABLE
            driver = db.query(models.Driver).filter(models.Driver.id == db_job.driver_id).first()
            if driver:
                driver.is_active = 1
        db.delete(db_job)
        db.commit()
        return True
    return False