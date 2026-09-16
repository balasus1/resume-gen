"""Integration tests verifying the user-uploaded resume succeeds in upload and parsing.

This test suite uses the exact user resume PDF (tests/fixtures/balasubramanian_shanmugham_resume.pdf)
and verifies:
1. The real document parser extracts clean, non-empty markdown from the PDF container.
2. The schema validation safely accepts LLM payloads where optional/unspecified fields
   such as project role, project years, and location are returned as null.
3. The POST /api/v1/resumes/upload endpoint completes with HTTP 200 and processing_status="ready".
4. The database record is successfully saved with structured ResumeData.
"""

from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.database import Database, db
from app.main import app
from app.schemas.models import Project, ResumeData
from app.services.parser import _parse_document_sync, _validate_parsed_resume

FIXTURE_PDF_PATH = (
    Path(__file__).resolve().parent.parent / "fixtures" / "balasubramanian_shanmugham_resume.pdf"
)


@pytest.fixture
def user_resume_bytes() -> bytes:
    assert FIXTURE_PDF_PATH.exists(), f"Missing fixture file: {FIXTURE_PDF_PATH}"
    return FIXTURE_PDF_PATH.read_bytes()


@pytest.fixture
def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.fixture
def user_resume_llm_payload() -> dict[str, object]:
    """Realistic LLM extraction payload for this resume where roles/years are null for projects."""
    return {
        "personalInfo": {
            "name": "BALASUBRAMANIAN SHANMUGHAM",
            "title": "SENIOR BACKEND ENGINEER, JAVA | SPRING BOOT",
            "email": "bala.s0027@gmail.com",
            "phone": "+91-8884907414",
            "location": "India",
            "website": "https://portfolio.balashan.dev",
            "linkedin": "https://linkedin.com/in/spike0027",
            "github": "https://github.com/balasus1",
        },
        "summary": "15 years of backend engineering experience building enterprise applications at scale in Java, Spring Boot using microservice patterns...",
        "workExperience": [
            {
                "id": 1,
                "title": "Senior Backend Engineer — Java",
                "company": "Bahwan CyberTek Pvt Ltd",
                "location": None,
                "years": "Jul 2018 – Present",
                "description": [
                    "Continuous employment; the entries below reflect concurrent client engagements...",
                    "Designed and deployed containerised microservices on Kubernetes via Red Hat OpenShift...",
                ],
                "descriptionStyles": ["plain", "bullet"],
            }
        ],
        "education": [
            {
                "id": 1,
                "institution": "Pondicherry University",
                "degree": "Bachelor of Technology, Electrical & Electronics",
                "years": "Jun 2000 – May 2004",
                "description": None,
            }
        ],
        "personalProjects": [
            {
                "id": 1,
                "name": "Centralised Job Scheduler",
                "role": None,  # Was causing validation failure
                "years": "Feb 2025 – Present",
                "description": ["Designed and implemented multiple scheduler job types"],
                "descriptionStyles": ["bullet"],
            },
            {
                "id": 2,
                "name": "getConsenso",
                "role": None,  # Was causing validation failure
                "years": None,  # Was causing validation failure
                "description": ["Contract-first API governance platform"],
                "descriptionStyles": ["bullet"],
            },
            {
                "id": 3,
                "name": "ZeroMem",
                "role": None,
                "years": None,
                "github": "github.com/balasus1/zeromem",
                "website": None,
                "description": ["Open-source (MIT) agent-memory orchestrator"],
                "descriptionStyles": ["bullet"],
            },
        ],
        "additional": {
            "technicalSkills": ["Java", "Spring Boot", "Kafka", "Docker", "Kubernetes"],
            "languages": [],
            "certificationsTraining": ["Advanced Cloud Computing, Blockchain & IoT — IIT Chennai"],
            "awards": ["WeMakeDevs Hackathons", "AMD Developer Program", "MLH Member"],
        },
        "customSections": {},
    }


def test_user_resume_pdf_extraction(user_resume_bytes: bytes) -> None:
    """The user's PDF extracts readable text without errors."""
    extracted = _parse_document_sync(user_resume_bytes, "balasubramanian_shanmugham_resume.pdf")
    assert "BALASUBRAMANIAN SHANMUGHAM" in extracted
    assert "Centralised Job Scheduler" in extracted
    assert "ZeroMem" in extracted


def test_resume_data_schema_coerces_null_project_fields(
    user_resume_llm_payload: dict[str, object]
) -> None:
    """Pydantic model ResumeData accepts null project role and years, coercing them to empty strings."""
    validated = ResumeData.model_validate(user_resume_llm_payload)
    assert len(validated.personalProjects) == 3

    p1 = validated.personalProjects[0]
    assert p1.name == "Centralised Job Scheduler"
    assert p1.role == ""
    assert p1.years == "Feb 2025 – Present"

    p2 = validated.personalProjects[1]
    assert p2.name == "getConsenso"
    assert p2.role == ""
    assert p2.years == ""

    p3 = validated.personalProjects[2]
    assert p3.name == "ZeroMem"
    assert p3.role == ""
    assert p3.years == ""
    assert p3.github == "github.com/balasus1/zeromem"

    # Also test _validate_parsed_resume helper from parser service
    validated_dict = _validate_parsed_resume(user_resume_llm_payload)
    assert validated_dict["personalProjects"][0]["role"] == ""
    assert validated_dict["personalProjects"][1]["years"] == ""


async def test_user_resume_upload_endpoint_success(
    client: AsyncClient,
    isolated_db: Database,
    user_resume_bytes: bytes,
    user_resume_llm_payload: dict[str, object],
) -> None:
    """Uploading the exact user PDF returns 200 with processing_status='ready' and stores parsed data."""
    validated_data = ResumeData.model_validate(user_resume_llm_payload).model_dump()

    with patch(
        "app.routers.resumes.parse_resume_to_json",
        new_callable=AsyncMock,
        return_value=validated_data,
    ) as mock_parse:
        async with client:
            response = await client.post(
                "/api/v1/resumes/upload",
                files={
                    "file": (
                        "balasubramanian_shanmugham_resume.pdf",
                        user_resume_bytes,
                        "application/pdf",
                    )
                },
            )

    assert response.status_code == 200
    res_json = response.json()
    assert res_json["processing_status"] == "ready"
    assert "uploaded successfully" in res_json["message"]
    resume_id = res_json["resume_id"]
    mock_parse.assert_awaited_once()

    # Verify database record
    stored = await isolated_db.get_resume(resume_id)
    assert stored is not None
    assert stored["processing_status"] == "ready"
    assert stored["processed_data"] is not None
    assert stored["processed_data"]["personalInfo"]["name"] == "BALASUBRAMANIAN SHANMUGHAM"
    assert len(stored["processed_data"]["personalProjects"]) == 3
    assert stored["processed_data"]["personalProjects"][0]["role"] == ""
    assert stored["processed_data"]["personalProjects"][1]["years"] == ""
