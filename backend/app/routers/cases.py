from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import Case
from ..schemas import CaseCreate, CaseUpdate, CaseResponse

router = APIRouter(prefix="/api/cases", tags=["cases"])


def calculate_tone(case_type: str, severity: str, evidence_strength: str) -> str:
    """Calculate tone based on case attributes"""
    if case_type in ['Employee Fraud', 'Vendor Fraud'] and severity == 'High' and evidence_strength == 'Documentary':
        return 'Very Strict'
    elif case_type in ['Employee Fraud', 'Vendor Fraud'] and severity == 'Medium':
        return 'Strict'
    elif case_type == 'Employee Misconduct' and evidence_strength in ['Both', 'Documentary']:
        return 'Balanced'
    else:
        return 'Cautious / Advisory'


def generate_case_number(db: Session) -> str:
    """Generate unique case number"""
    year = datetime.now().year
    count = db.query(Case).filter(Case.case_number.like(f'INV-{year}-%')).count() + 1
    return f"INV-{year}-{str(count).zfill(4)}"


@router.post("/", response_model=CaseResponse)
def create_case(case: CaseCreate, db: Session = Depends(get_db)):
    case_number = generate_case_number(db)
    tone = calculate_tone(case.case_type, case.severity, case.evidence_strength)

    db_case = Case(
        case_number=case_number,
        case_type=case.case_type,
        severity=case.severity,
        evidence_strength=case.evidence_strength,
        impact_type=case.impact_type,
        subject=case.subject,
        description=case.description,
        tone=tone
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case


@router.get("/", response_model=List[CaseResponse])
def list_cases(
    status: str = None,
    severity: str = None,
    case_type: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Case)
    if status:
        query = query.filter(Case.status == status)
    if severity:
        query = query.filter(Case.severity == severity)
    if case_type:
        query = query.filter(Case.case_type == case_type)
    return query.order_by(Case.created_at.desc()).all()


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.put("/{case_id}", response_model=CaseResponse)
def update_case(case_id: int, case_update: CaseUpdate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    update_data = case_update.model_dump(exclude_unset=True)

    # Recalculate tone if relevant fields changed
    if any(k in update_data for k in ['case_type', 'severity', 'evidence_strength']):
        case_type = update_data.get('case_type', case.case_type)
        severity = update_data.get('severity', case.severity)
        evidence_strength = update_data.get('evidence_strength', case.evidence_strength)
        update_data['tone'] = calculate_tone(case_type, severity, evidence_strength)

    for key, value in update_data.items():
        setattr(case, key, value)

    db.commit()
    db.refresh(case)
    return case


@router.delete("/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    db.delete(case)
    db.commit()
    return {"message": "Case deleted successfully"}
