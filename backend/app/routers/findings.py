from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Finding, Case
from ..schemas import FindingCreate, FindingResponse

router = APIRouter(prefix="/api/cases/{case_id}/findings", tags=["findings"])


def generate_finding_id(db: Session, case_id: int) -> str:
    """Generate sequential finding ID for case"""
    count = db.query(Finding).filter(Finding.case_id == case_id).count() + 1
    return f"F{count}"


@router.post("/", response_model=FindingResponse)
def add_finding(
    case_id: int,
    finding: FindingCreate,
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    finding_id = generate_finding_id(db, case_id)

    db_finding = Finding(
        case_id=case_id,
        finding_id=finding_id,
        description=finding.description,
        evidence_ids=finding.evidence_ids
    )
    db.add(db_finding)
    db.commit()
    db.refresh(db_finding)
    return db_finding


@router.get("/", response_model=List[FindingResponse])
def list_findings(case_id: int, db: Session = Depends(get_db)):
    return db.query(Finding).filter(Finding.case_id == case_id).all()


@router.delete("/{finding_id}")
def delete_finding(case_id: int, finding_id: int, db: Session = Depends(get_db)):
    finding = db.query(Finding).filter(
        Finding.id == finding_id,
        Finding.case_id == case_id
    ).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    db.delete(finding)
    db.commit()
    return {"message": "Finding deleted successfully"}
