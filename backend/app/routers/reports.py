from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Report, Case, Evidence, Interview, Finding
from ..schemas import ReportResponse, QualityCheckResponse
from ..services.report_generator import generate_investigation_report

router = APIRouter(prefix="/api/cases/{case_id}", tags=["reports"])


@router.post("/generate-report", response_model=ReportResponse)
def generate_report(case_id: int, db: Session = Depends(get_db)):
    """Generate AI-powered investigation report"""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Gather all case data
    evidence = db.query(Evidence).filter(Evidence.case_id == case_id).all()
    interviews = db.query(Interview).filter(Interview.case_id == case_id).all()
    findings = db.query(Finding).filter(Finding.case_id == case_id).all()

    # Get current version number
    existing_reports = db.query(Report).filter(Report.case_id == case_id).count()
    new_version = existing_reports + 1

    # Generate report content using AI
    report_content = generate_investigation_report(
        case=case,
        evidence=evidence,
        interviews=interviews,
        findings=findings
    )

    # Create report record
    db_report = Report(
        case_id=case_id,
        version=new_version,
        content=report_content,
        quality_checks=None,
        status="Draft"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Update case status
    case.status = "Draft Ready"
    db.commit()

    return db_report


@router.get("/quality-check", response_model=QualityCheckResponse)
def run_quality_checks(case_id: int, db: Session = Depends(get_db)):
    """Run quality checks before finalizing report"""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    evidence = db.query(Evidence).filter(Evidence.case_id == case_id).all()
    findings = db.query(Finding).filter(Finding.case_id == case_id).all()

    issues = []

    # Check 1: Evidence linkage
    unlinked_evidence = [e for e in evidence if not e.linked_findings]
    evidence_linked = len(unlinked_evidence) == 0
    if not evidence_linked:
        issues.append(f"{len(unlinked_evidence)} evidence items not linked to findings")

    # Check 2: Findings have evidence
    findings_without_evidence = [f for f in findings if not f.evidence_ids]
    sections_complete = len(findings_without_evidence) == 0
    if not sections_complete:
        issues.append(f"{len(findings_without_evidence)} findings lack evidence references")

    # Check 3: Language safety (placeholder - would use AI in production)
    language_safe = True

    # Check 4: Consistency validation (placeholder)
    consistency_valid = True

    can_finalize = evidence_linked and sections_complete and language_safe and consistency_valid

    return QualityCheckResponse(
        evidence_linked=evidence_linked,
        sections_complete=sections_complete,
        language_safe=language_safe,
        consistency_valid=consistency_valid,
        issues=issues,
        can_finalize=can_finalize
    )


@router.get("/reports", response_model=List[ReportResponse])
def list_reports(case_id: int, db: Session = Depends(get_db)):
    return db.query(Report).filter(Report.case_id == case_id).order_by(Report.version.desc()).all()


@router.get("/reports/{report_id}", response_model=ReportResponse)
def get_report(case_id: int, report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.case_id == case_id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.put("/reports/{report_id}/finalize", response_model=ReportResponse)
def finalize_report(case_id: int, report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.case_id == case_id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Run quality checks first
    quality = run_quality_checks(case_id, db)
    if not quality.can_finalize:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot finalize. Issues: {', '.join(quality.issues)}"
        )

    report.status = "Final"
    report.quality_checks = {
        "evidence_linked": quality.evidence_linked,
        "sections_complete": quality.sections_complete,
        "language_safe": quality.language_safe,
        "consistency_valid": quality.consistency_valid
    }

    # Update case status
    case = db.query(Case).filter(Case.id == case_id).first()
    case.status = "Completed"

    db.commit()
    db.refresh(report)
    return report
