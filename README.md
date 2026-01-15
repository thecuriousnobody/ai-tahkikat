# Investigation Report Automation Platform

An AI-powered platform that helps compliance/HR teams create legally defensible investigation reports. The system generates structured reports based on evidence and interviews, with automatic tone control based on case severity.

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL (Neon)
- **AI:** Claude API for report generation

## Features

- Case management with automatic case numbering
- Evidence tracking and linking
- Interview recording
- Key findings documentation
- AI-powered report generation with tone control
- Quality checks before report finalization

## Tone Control System

The report tone is automatically calculated based on:
- Case type (Fraud, Misconduct, Policy Violation)
- Severity level (High, Medium, Low)
- Evidence strength (Documentary, Testimonial, Both)

| Tone | When Applied |
|------|--------------|
| Very Strict | Employee/Vendor Fraud + High Severity + Documentary Evidence |
| Strict | Employee/Vendor Fraud + Medium Severity |
| Balanced | Employee Misconduct + Documentary/Both Evidence |
| Cautious/Advisory | All other cases |

## Project Structure

```
investigation-platform/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── database.py       # Database connection
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── routers/          # API routes
│   │   │   ├── cases.py
│   │   │   ├── evidence.py
│   │   │   ├── interviews.py
│   │   │   ├── findings.py
│   │   │   └── reports.py
│   │   └── services/
│   │       └── report_generator.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Anthropic API key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and ANTHROPIC_API_KEY

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Database Setup

Run this SQL in your PostgreSQL database:

```sql
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(20) UNIQUE,
    case_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    evidence_strength VARCHAR(20) NOT NULL,
    impact_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'In Progress',
    tone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    evidence_id VARCHAR(10) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT,
    evidence_type VARCHAR(30),
    source VARCHAR(255),
    relevance TEXT,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    linked_findings TEXT[] DEFAULT '{}'
);

CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    interviewee_name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    interview_date TIMESTAMP,
    mode VARCHAR(50),
    summary TEXT,
    linked_evidence TEXT[] DEFAULT '{}',
    is_management_explanation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    content JSONB,
    quality_checks JSONB,
    status VARCHAR(20) DEFAULT 'Draft',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE findings (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    finding_id VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,
    evidence_ids TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_severity ON cases(severity);
CREATE INDEX idx_evidence_case ON evidence(case_id);
CREATE INDEX idx_interviews_case ON interviews(case_id);
CREATE INDEX idx_reports_case ON reports(case_id);
```

## Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## API Endpoints

### Cases
- `POST /api/cases` - Create new case
- `GET /api/cases` - List cases (with filters)
- `GET /api/cases/{id}` - Get case details
- `PUT /api/cases/{id}` - Update case
- `DELETE /api/cases/{id}` - Delete case

### Evidence
- `POST /api/cases/{case_id}/evidence` - Add evidence
- `GET /api/cases/{case_id}/evidence` - List evidence
- `PUT /api/cases/{case_id}/evidence/{id}` - Update evidence
- `DELETE /api/cases/{case_id}/evidence/{id}` - Delete evidence

### Interviews
- `POST /api/cases/{case_id}/interviews` - Add interview
- `GET /api/cases/{case_id}/interviews` - List interviews
- `PUT /api/cases/{case_id}/interviews/{id}` - Update interview
- `DELETE /api/cases/{case_id}/interviews/{id}` - Delete interview

### Findings
- `POST /api/cases/{case_id}/findings` - Add finding
- `GET /api/cases/{case_id}/findings` - List findings
- `DELETE /api/cases/{case_id}/findings/{id}` - Delete finding

### Reports
- `POST /api/cases/{case_id}/generate-report` - Generate AI report
- `GET /api/cases/{case_id}/reports` - List reports
- `GET /api/cases/{case_id}/reports/{id}` - Get report
- `PUT /api/cases/{case_id}/reports/{id}/finalize` - Finalize report
- `GET /api/cases/{case_id}/quality-check` - Run quality checks

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
ANTHROPIC_API_KEY=sk-ant-your-key-here
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

## License

MIT
