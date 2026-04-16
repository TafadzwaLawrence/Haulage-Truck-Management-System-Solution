from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database
from ..dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.post("/", response_model=schemas.DriverResponse)
def create_driver(driver: schemas.DriverCreate, db: Session = Depends(database.get_db), _=Depends(get_current_user)):
    logger.info(f"Create driver: {driver.name}")
    return crud.create_driver(db, driver)

@router.get("/", response_model=List[schemas.DriverResponse])
def read_drivers(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(database.get_db)):
    return crud.get_drivers(db, skip=skip, limit=limit)

@router.get("/{driver_id}", response_model=schemas.DriverResponse)
def read_driver(driver_id: int, db: Session = Depends(database.get_db)):
    driver = crud.get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.put("/{driver_id}", response_model=schemas.DriverResponse)
def update_driver(driver_id: int, driver: schemas.DriverUpdate, db: Session = Depends(database.get_db), _=Depends(get_current_user)):
    updated = crud.update_driver(db, driver_id, driver)
    if not updated:
        raise HTTPException(status_code=404, detail="Driver not found")
    return updated

@router.delete("/{driver_id}")
def delete_driver(driver_id: int, db: Session = Depends(database.get_db), _=Depends(get_current_user)):
    if not crud.delete_driver(db, driver_id):
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"ok": True}