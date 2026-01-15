from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import cases, evidence, interviews, reports, findings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Investigation Report Automation Platform",
    description="AI-powered investigation report generation system",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cases.router)
app.include_router(evidence.router)
app.include_router(interviews.router)
app.include_router(findings.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {
        "name": "Investigation Report Automation Platform",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
