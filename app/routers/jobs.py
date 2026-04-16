from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database
from ..dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate, db: Session = Depends(database.get_db), _=Depends(get_current_user)):
    try:
        logger.info(f"Create job: {job.pickup_location} -> {job.delivery_location}")
        return crud.create_job(db, job)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.JobResponse])
def read_jobs(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(database.get_db)):
    return crud.get_jobs(db, skip=skip, limit=limit)

@router.get("/{job_id}", response_model=schemas.JobResponse)
def read_job(job_id: int, db: Session = Depends(database.get_db)):
    job = crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.put("/{job_id}", response_model=schemas.JobResponse)
def update_job(job_id: int, job: schemas.JobUpdate, db: Session = Depends(database.get_db), _=Depends(get_current_user)):
    updated = crud.update_job(db, job_id, job)
    if not updated:
        raise HTTPException(status_code=404, detail="Job not found")
    return updated

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(database.get_db), _=Depends(get_current_user)):
    if not crud.delete_job(db, job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    return {"ok": True}