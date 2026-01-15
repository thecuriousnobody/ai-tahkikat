from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Interview, Case
from ..schemas import InterviewCreate, InterviewUpdate, InterviewResponse

router = APIRouter(prefix="/api/cases/{case_id}/interviews", tags=["interviews"])


@router.post("/", response_model=InterviewResponse)
def add_interview(
    case_id: int,
    interview: InterviewCreate,
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    db_interview = Interview(
        case_id=case_id,
        interviewee_name=interview.interviewee_name,
        role=interview.role,
        interview_date=interview.interview_date,
        mode=interview.mode,
        summary=interview.summary,
        linked_evidence=[],
        is_management_explanation=False
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview


@router.get("/", response_model=List[InterviewResponse])
def list_interviews(case_id: int, db: Session = Depends(get_db)):
    return db.query(Interview).filter(Interview.case_id == case_id).all()


@router.put("/{interview_id}", response_model=InterviewResponse)
def update_interview(
    case_id: int,
    interview_id: int,
    interview_update: InterviewUpdate,
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.case_id == case_id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    update_data = interview_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(interview, key, value)

    db.commit()
    db.refresh(interview)
    return interview


@router.delete("/{interview_id}")
def delete_interview(case_id: int, interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.case_id == case_id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.delete(interview)
    db.commit()
    return {"message": "Interview deleted successfully"}
