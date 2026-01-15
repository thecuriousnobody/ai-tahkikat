import os
from dotenv import load_dotenv

load_dotenv()

# Lazy initialization of Anthropic client
_client = None

def get_anthropic_client():
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")
        from anthropic import Anthropic
        _client = Anthropic(api_key=api_key)
    return _client

REPORT_SECTIONS = [
    "Investigation Summary",
    "Scope & Methodology",
    "Allegations / Issues Examined",
    "Facts Established",
    "Key Observations",
    "Gaps Identified",
    "Modus Operandi",  # Fraud cases only
    "Evidence & Testimonials Summary",
    "Risk & Impact Assessment",
    "Conclusion",
    "Way Forward & Recommendations",
    "Disclaimer & Confidentiality"
]

TONE_GUIDELINES = {
    "Very Strict": "Use direct, unambiguous language. State facts clearly. Attribute actions definitively where evidence supports. Use phrases like 'the evidence establishes', 'clearly demonstrates', 'unequivocally shows'.",
    "Strict": "Use firm but measured language. State findings with confidence where supported. Use phrases like 'the evidence indicates', 'strongly suggests', 'demonstrates'.",
    "Balanced": "Use neutral, objective language. Present facts without strong attribution. Use phrases like 'the evidence suggests', 'appears to indicate', 'may demonstrate'.",
    "Cautious / Advisory": "Use tentative language given weak evidence. Emphasize limitations. Use phrases like 'limited evidence suggests', 'could not be conclusively established', 'warrants further investigation'."
}


def generate_investigation_report(case, evidence, interviews, findings):
    """Generate structured investigation report using Claude API"""

    # Build context from case data
    evidence_summary = "\n".join([
        f"- {e.evidence_id}: {e.file_name} ({e.evidence_type}) - {e.relevance or 'No relevance noted'}"
        for e in evidence
    ])

    interview_summary = "\n".join([
        f"- {i.interviewee_name} ({i.role}): {i.summary or 'Summary pending'}"
        for i in interviews
    ])

    findings_summary = "\n".join([
        f"- {f.finding_id}: {f.description} [Evidence: {', '.join(f.evidence_ids)}]"
        for f in findings
    ])

    tone_instruction = TONE_GUIDELINES.get(case.tone, TONE_GUIDELINES["Balanced"])

    # Determine if modus operandi section is needed
    include_modus = case.case_type in ["Employee Fraud", "Vendor Fraud"]
    sections_to_generate = [s for s in REPORT_SECTIONS if s != "Modus Operandi" or include_modus]

    prompt = f"""Generate a professional investigation report with the following structure and tone.

CASE DETAILS:
- Case Number: {case.case_number}
- Case Type: {case.case_type}
- Subject: {case.subject}
- Description: {case.description}
- Severity: {case.severity}
- Evidence Strength: {case.evidence_strength}
- Impact Type: {case.impact_type}

TONE REQUIREMENT: {case.tone}
{tone_instruction}

EVIDENCE AVAILABLE:
{evidence_summary if evidence_summary else "No evidence uploaded yet."}

INTERVIEWS CONDUCTED:
{interview_summary if interview_summary else "No interviews recorded yet."}

KEY FINDINGS:
{findings_summary if findings_summary else "No findings documented yet."}

Generate the report with these exact sections:
{chr(10).join([f"{i+1}. {s}" for i, s in enumerate(sections_to_generate)])}

CRITICAL RULES:
1. Every factual claim MUST reference specific evidence (E1, E2, etc.)
2. Do NOT attribute intent unless directly evidenced
3. Do NOT use defamatory language
4. Maintain the specified tone throughout
5. Include specific evidence references in parentheses after claims
6. If evidence is weak, explicitly state limitations

Return the report as a JSON object with section names as keys and content as values.
"""

    try:
        client = get_anthropic_client()
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )

        # Parse response - in production, add proper JSON parsing
        content = response.content[0].text

        # For MVP, return structured content
        return {
            "sections": sections_to_generate,
            "content": content,
            "tone_applied": case.tone,
            "evidence_count": len(evidence),
            "interview_count": len(interviews),
            "findings_count": len(findings)
        }

    except Exception as e:
        # Fallback to template if AI fails
        return {
            "sections": sections_to_generate,
            "content": f"Report generation failed: {str(e)}. Please try again.",
            "tone_applied": case.tone,
            "error": True
        }
