from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============ CASE SCHEMAS ============
class CaseBase(BaseModel):
    case_type: str
    severity: str
    evidence_strength: str
    impact_type: str
    subject: str
    description: Optional[str] = None


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    case_type: Optional[str] = None
    severity: Optional[str] = None
    evidence_strength: Optional[str] = None
    impact_type: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class CaseResponse(CaseBase):
    id: int
    case_number: str
    status: str
    tone: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============ EVIDENCE SCHEMAS ============
class EvidenceBase(BaseModel):
    file_name: str
    evidence_type: Optional[str] = None
    source: Optional[str] = None
    relevance: Optional[str] = None


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceUpdate(BaseModel):
    evidence_type: Optional[str] = None
    source: Optional[str] = None
    relevance: Optional[str] = None
    linked_findings: Optional[List[str]] = None


class EvidenceResponse(EvidenceBase):
    id: int
    case_id: int
    evidence_id: str
    file_url: Optional[str]
    date_added: datetime
    linked_findings: List[str]

    class Config:
        from_attributes = True


# ============ INTERVIEW SCHEMAS ============
class InterviewBase(BaseModel):
    interviewee_name: str
    role: Optional[str] = None
    interview_date: Optional[datetime] = None
    mode: Optional[str] = None
    summary: Optional[str] = None


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    interviewee_name: Optional[str] = None
    role: Optional[str] = None
    interview_date: Optional[datetime] = None
    mode: Optional[str] = None
    summary: Optional[str] = None
    linked_evidence: Optional[List[str]] = None
    is_management_explanation: Optional[bool] = None


class InterviewResponse(InterviewBase):
    id: int
    case_id: int
    linked_evidence: List[str]
    is_management_explanation: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ FINDING SCHEMAS ============
class FindingBase(BaseModel):
    description: str
    evidence_ids: List[str]


class FindingCreate(FindingBase):
    pass


class FindingResponse(FindingBase):
    id: int
    case_id: int
    finding_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ REPORT SCHEMAS ============
class ReportResponse(BaseModel):
    id: int
    case_id: int
    version: int
    content: dict
    quality_checks: Optional[dict]
    status: str
    generated_at: datetime

    class Config:
        from_attributes = True


class QualityCheckResponse(BaseModel):
    evidence_linked: bool
    sections_complete: bool
    language_safe: bool
    consistency_valid: bool
    issues: List[str]
    can_finalize: bool
