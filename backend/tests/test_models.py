"""
Test suite for Pydantic data models.
Tests validation, serialization, and model behavior.
"""

import pytest
from datetime import datetime
from pydantic import ValidationError
from app.models import (
    AnalysisResult,
    ProcessingStatus,
    AssessmentScopeRequest,
    ControlMapping,
    ControlGap,
    OSCALComponent,
    POAMEntry,
    EvidenceArtifact,
    EvidenceType,
    RemediationTask,
    RiskLevel,
    BaselineLevel,
    AssessmentMode,
    ControlFamily
)


class TestEnums:
    """Tests for enum models."""
    
    def test_risk_level_enum(self):
        """Test RiskLevel enum values."""
        assert RiskLevel.CRITICAL == "critical"
        assert RiskLevel.HIGH == "high"
        assert RiskLevel.MEDIUM == "medium"
        assert RiskLevel.LOW == "low"
    
    def test_baseline_level_enum(self):
        """Test BaselineLevel enum values."""
        assert BaselineLevel.LOW == "low"
        assert BaselineLevel.MODERATE == "moderate"
        assert BaselineLevel.HIGH == "high"
    
    def test_assessment_mode_enum(self):
        """Test AssessmentMode enum values."""
        assert AssessmentMode.DEEP == "deep"
        assert AssessmentMode.SMART == "smart"
        assert AssessmentMode.QUICK == "quick"


class TestEvidenceArtifact:
    """Tests for EvidenceArtifact model."""
    
    def test_evidence_artifact_creation(self):
        """Test creating evidence artifact."""
        evidence = EvidenceArtifact(
            id="ev-001",
            filename="corporate_handbook.pdf",
            file_type=EvidenceType.PDF_DOCUMENT,
            content_summary="Sample policy document",
            confidence_score=0.95
        )
        
        assert evidence.id == "ev-001"
        assert evidence.file_type == EvidenceType.PDF_DOCUMENT
        assert evidence.confidence_score == 0.95
    
    def test_evidence_artifact_with_metadata(self):
        """Test evidence artifact with metadata."""
        evidence = EvidenceArtifact(
            id="ev-002",
            filename="auth_settings.png",
            file_type=EvidenceType.SCREENSHOT,
            content_summary="MFA configuration screenshot",
            confidence_score=0.88,
            metadata={"page_count": 1, "resolution": "1920x1080"}
        )
        
        assert evidence.metadata["page_count"] == 1


class TestControlMapping:
    """Tests for ControlMapping model."""
    
    def test_control_mapping_creation(self):
        """Test creating control mapping."""
        mapping = ControlMapping(
            control_id="AC-2",
            control_name="Account Management",
            control_family=ControlFamily.AC,
            evidence_ids=["ev-001", "ev-002"],
            implementation_status="implemented",
            implementation_description="Account management policies implemented",
            confidence_score=0.92
        )
        
        assert mapping.control_id == "AC-2"
        assert len(mapping.evidence_ids) == 2
        assert mapping.confidence_score == 0.92


class TestControlGap:
    """Tests for ControlGap model."""
    
    def test_control_gap_creation(self):
        """Test creating control gap."""
        gap = ControlGap(
            control_id="IA-5",
            control_name="Authenticator Management",
            gap_description="Multi-factor authentication not fully implemented",
            risk_level=RiskLevel.HIGH,
            risk_score=75,
            affected_requirements=["IA-5(1)", "IA-5(2)"],
            recommended_actions=["Implement MFA for all user accounts"]
        )
        
        assert gap.control_id == "IA-5"
        assert gap.risk_level == RiskLevel.HIGH
        assert len(gap.recommended_actions) > 0


class TestOSCALComponent:
    """Tests for OSCALComponent model."""
    
    def test_oscal_component_creation(self):
        """Test creating OSCAL component."""
        component = OSCALComponent(
            uuid="12345678-1234-1234-1234-123456789012",
            component_id="comp-001",
            title="Identity Management System",
            description="Corporate IdP implementation",
            component_type="software",
            control_implementations=[{"control_id": "AC-2"}, {"control_id": "IA-5"}]
        )
        
        assert component.component_id == "comp-001"
        assert len(component.control_implementations) == 2


class TestPOAMEntry:
    """Tests for POAMEntry model."""
    
    def test_poam_entry_creation(self):
        """Test creating POA&M entry."""
        poam = POAMEntry(
            uuid="12345678-1234-1234-1234-123456789012",
            poam_id="poam-001",
            title="Implement MFA",
            description="Multi-factor authentication gap",
            related_controls=["IA-5"],
            risk_level=RiskLevel.HIGH,
            remediation_plan="Deploy MFA solution by Q2",
            scheduled_completion_date="2026-06-30",
            status="open"
        )
        
        assert poam.poam_id == "poam-001"
        assert poam.risk_level == RiskLevel.HIGH
        assert poam.status == "open"


class TestRemediationTask:
    """Tests for RemediationTask model."""
    
    def test_remediation_task_creation(self):
        """Test creating remediation task."""
        task = RemediationTask(
            task_id="task-001",
            title="Enable MFA for Admin Accounts",
            description="Configure MFA in IdP",
            priority=RiskLevel.HIGH,
            effort_estimate="medium",
            related_gaps=["gap-001"],
            implementation_guide="Follow MFA deployment guide",
            verification_steps=["Test login with MFA enabled"]
        )
        
        assert task.task_id == "task-001"
        assert task.priority == RiskLevel.HIGH


class TestProcessingStatus:
    """Tests for ProcessingStatus model."""
    
    def test_processing_status_creation(self):
        """Test creating processing status."""
        status = ProcessingStatus(
            session_id="sess-123",
            stage="analyzing",
            progress=45,
            current_step="Analyzing evidence artifacts",
            message="Processing document 3 of 5"
        )
        
        assert status.session_id == "sess-123"
        assert status.progress == 45
        assert status.stage == "analyzing"
    
    def test_processing_status_with_error(self):
        """Test processing status with error."""
        status = ProcessingStatus(
            session_id="sess-124",
            stage="error",
            progress=30,
            current_step="Document processing failed",
            message="Unable to extract PDF text",
            error="Corrupted PDF file"
        )
        
        assert status.error is not None
        assert status.stage == "error"


class TestAnalysisResult:
    """Tests for AnalysisResult model."""
    
    def test_analysis_result_creation(self):
        """Test creating analysis result."""
        result = AnalysisResult(
            session_id="sess-100",
            evidence_artifacts=[],
            control_mappings=[],
            control_gaps=[],
            oscal_components=[],
            poam_entries=[],
            remediation_tasks=[],
            total_controls_analyzed=50,
            implemented_controls=35,
            gaps_identified=15,
            critical_gaps=3,
            overall_compliance_score=70.0
        )
        
        assert result.session_id == "sess-100"
        assert result.total_controls_analyzed == 50
        assert result.overall_compliance_score == 70.0
    
    def test_analysis_result_compliance_score_validation(self):
        """Test compliance score must be 0-100."""
        with pytest.raises(ValidationError):
            AnalysisResult(
                session_id="sess-101",
                evidence_artifacts=[],
                control_mappings=[],
                control_gaps=[],
                oscal_components=[],
                poam_entries=[],
                remediation_tasks=[],
                total_controls_analyzed=10,
                implemented_controls=5,
                gaps_identified=5,
                critical_gaps=1,
                overall_compliance_score=150.0  # Invalid - over 100
            )


class TestAssessmentScopeRequest:
    """Tests for AssessmentScopeRequest model."""
    
    def test_assessment_scope_basic(self):
        """Test basic assessment scope."""
        scope = AssessmentScopeRequest(
            baseline="moderate",
            mode="smart"
        )
        
        assert scope.baseline == "moderate"
        assert scope.mode == "smart"
    
    def test_assessment_scope_with_families(self):
        """Test assessment scope with control families."""
        scope = AssessmentScopeRequest(
            baseline="high",
            mode="deep",
            control_families=["AC", "IA", "SC"]
        )
        
        assert len(scope.control_families) == 3
        assert "AC" in scope.control_families
    
    def test_assessment_scope_with_specific_controls(self):
        """Test assessment scope with specific controls."""
        scope = AssessmentScopeRequest(
            baseline="low",
            mode="quick",
            specific_controls=["AC-2", "AC-3", "IA-5"]
        )
        
        assert len(scope.specific_controls) == 3
        assert "AC-2" in scope.specific_controls
