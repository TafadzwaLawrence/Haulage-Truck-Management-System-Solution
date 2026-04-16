from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database
from ..dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/trucks", tags=["Trucks"])

@router.post("/", response_model=schemas.TruckResponse)
def create_truck(truck: schemas.TruckCreate, db: Session = Depends(database.get_db), _=Depends(get_current_user)):
    logger.info(f"Create truck: {truck.registration_number}")
    return crud.create_truck(db, truck)

@router.get("/", response_model=List[schemas.TruckResponse])
def read_trucks(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(database.get_db)):
    return crud.get_trucks(db, skip=skip, limit=limit)

@router.get("/{truck_id}", response_model=schemas.TruckResponse)
def read_truck(truck_id: int, db: Session = Depends(database.get_db)):
    truck = crud.get_truck(db, truck_id)
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    return truck

@router.put("/{truck_id}", response_model=schemas.TruckResponse)
def update_truck(truck_id: int, truck: schemas.TruckUpdate, db: Session = Depends(database.get_db), _=Depends(get_current_user)):
    updated = crud.update_truck(db, truck_id, truck)
    if not updated:
        raise HTTPException(status_code=404, detail="Truck not found")
    return updated

@router.delete("/{truck_id}")
def delete_truck(truck_id: int, db: Session = Depends(database.get_db), _=Depends(get_current_user)):
    if not crud.delete_truck(db, truck_id):
        raise HTTPException(status_code=404, detail="Truck not found")
    return {"ok": True}