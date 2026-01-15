from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(20), unique=True, index=True)
    case_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    evidence_strength = Column(String(20), nullable=False)
    impact_type = Column(String(50), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(30), default="In Progress")
    tone = Column(String(30))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    evidence = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="case", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="case", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="case", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"))
    evidence_id = Column(String(10), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(Text)
    evidence_type = Column(String(30))
    source = Column(String(255))
    relevance = Column(Text)
    date_added = Column(DateTime(timezone=True), server_default=func.now())
    linked_findings = Column(ARRAY(String), default=[])

    case = relationship("Case", back_populates="evidence")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"))
    interviewee_name = Column(String(255), nullable=False)
    role = Column(String(255))
    interview_date = Column(DateTime)
    mode = Column(String(50))
    summary = Column(Text)
    linked_evidence = Column(ARRAY(String), default=[])
    is_management_explanation = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("Case", back_populates="interviews")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"))
    version = Column(Integer, default=1)
    content = Column(JSON)
    quality_checks = Column(JSON)
    status = Column(String(20), default="Draft")
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("Case", back_populates="reports")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"))
    finding_id = Column(String(10), nullable=False)
    description = Column(Text, nullable=False)
    evidence_ids = Column(ARRAY(String), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("Case", back_populates="findings")
