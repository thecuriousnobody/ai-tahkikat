from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Evidence, Case
from ..schemas import EvidenceCreate, EvidenceUpdate, EvidenceResponse

router = APIRouter(prefix="/api/cases/{case_id}/evidence", tags=["evidence"])


def generate_evidence_id(db: Session, case_id: int) -> str:
    """Generate sequential evidence ID for case"""
    count = db.query(Evidence).filter(Evidence.case_id == case_id).count() + 1
    return f"E{count}"


@router.post("/", response_model=EvidenceResponse)
def add_evidence(
    case_id: int,
    evidence: EvidenceCreate,
    db: Session = Depends(get_db)
):
    # Verify case exists
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    evidence_id = generate_evidence_id(db, case_id)

    db_evidence = Evidence(
        case_id=case_id,
        evidence_id=evidence_id,
        file_name=evidence.file_name,
        evidence_type=evidence.evidence_type,
        source=evidence.source,
        relevance=evidence.relevance,
        linked_findings=[]
    )
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence


@router.get("/", response_model=List[EvidenceResponse])
def list_evidence(case_id: int, db: Session = Depends(get_db)):
    return db.query(Evidence).filter(Evidence.case_id == case_id).all()


@router.put("/{evidence_id}", response_model=EvidenceResponse)
def update_evidence(
    case_id: int,
    evidence_id: int,
    evidence_update: EvidenceUpdate,
    db: Session = Depends(get_db)
):
    evidence = db.query(Evidence).filter(
        Evidence.id == evidence_id,
        Evidence.case_id == case_id
    ).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    update_data = evidence_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(evidence, key, value)

    db.commit()
    db.refresh(evidence)
    return evidence


@router.delete("/{evidence_id}")
def delete_evidence(case_id: int, evidence_id: int, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(
        Evidence.id == evidence_id,
        Evidence.case_id == case_id
    ).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    db.delete(evidence)
    db.commit()
    return {"message": "Evidence deleted successfully"}
