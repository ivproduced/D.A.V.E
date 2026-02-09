from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import re


class ControlFamily(str, Enum):
    """NIST 800-53 Control Families"""
    AC = "Access Control"
    AT = "Awareness and Training"
    AU = "Audit and Accountability"
    CA = "Assessment, Authorization, and Monitoring"
    CM = "Configuration Management"
    CP = "Contingency Planning"
    IA = "Identification and Authentication"
    IR = "Incident Response"
    MA = "Maintenance"
    MP = "Media Protection"
    PE = "Physical and Environmental Protection"
    PL = "Planning"
    PM = "Program Management"
    PS = "Personnel Security"
    PT = "PII Processing and Transparency"
    RA = "Risk Assessment"
    SA = "System and Services Acquisition"
    SC = "System and Communications Protection"
    SI = "System and Information Integrity"
    SR = "Supply Chain Risk Management"


class RiskLevel(str, Enum):
    """Risk scoring levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "informational"


class BaselineLevel(str, Enum):
    """NIST 800-53 Rev 5 baseline impact levels"""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CUSTOM = "custom"
    ALL = "all"


class AssessmentMode(str, Enum):
    """Assessment depth modes for processing"""
    DEEP = "deep"      # Full reasoning for all controls
    SMART = "smart"    # Selective deep reasoning for high-risk only
    QUICK = "quick"    # Basic validation, batch processing


class EvidenceType(str, Enum):
    """Types of evidence artifacts"""
    PDF_DOCUMENT = "pdf"
    WORD_DOCUMENT = "docx"
    SCREENSHOT = "screenshot"
    NETWORK_DIAGRAM = "diagram"
    CONFIG_FILE = "config"
    POLICY_DOCUMENT = "policy"
    UNKNOWN = "unknown"


class EvidenceArtifact(BaseModel):
    """Extracted evidence from uploaded files"""
    id: str
    filename: str
    file_type: EvidenceType
    content_summary: str
    extracted_text: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    controls_mentioned: List[str] = Field(default_factory=list)
    confidence_score: float = Field(ge=0.0, le=1.0)


class ControlMapping(BaseModel):
    """Mapping between evidence and NIST 800-53 control"""
    control_id: str  # e.g., "AC-2"
    control_name: str
    control_family: ControlFamily
    evidence_ids: List[str]
    implementation_status: str  # implemented, partially_implemented, planned, not_implemented
    implementation_description: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    gaps_identified: List[str] = Field(default_factory=list)


class ControlGap(BaseModel):
    """Identified gap in control implementation"""
    control_id: str
    control_name: str
    gap_description: str
    risk_level: RiskLevel
    risk_score: int = Field(ge=0, le=100)
    affected_requirements: List[str]
    recommended_actions: List[str]


class OSCALComponent(BaseModel):
    """OSCAL 1.2.0 SSP Component Definition"""
    uuid: str  # Required UUID in OSCAL 1.2.0
    component_id: str
    title: str
    description: str
    component_type: str  # software, hardware, service, policy, process, physical, validation
    control_implementations: List[Dict[str, Any]]
    props: Dict[str, str] = Field(default_factory=dict)
    links: List[Dict[str, str]] = Field(default_factory=list)
    responsible_roles: List[str] = Field(default_factory=list)
    protocols: List[Dict[str, Any]] = Field(default_factory=list)


class POAMEntry(BaseModel):
    """OSCAL 1.2.0 Plan of Action and Milestones entry"""
    uuid: str  # Required UUID in OSCAL 1.2.0
    poam_id: str
    title: str
    description: str
    related_controls: List[str]
    risk_level: RiskLevel
    scheduled_completion_date: Optional[str] = None
    milestones: List[Dict[str, Any]] = Field(default_factory=list)
    remediation_plan: str
    status: str = "open"  # open, in_progress, completed, risk_accepted
    related_observations: List[str] = Field(default_factory=list)  # OSCAL 1.2.0
    

class NISTValidationResult(BaseModel):
    """NIST 800-53 control validation result"""
    control_id: str
    control_title: str
    is_valid: bool
    coverage_score: float = Field(ge=0.0, le=1.0)
    requirements_met: List[str] = Field(default_factory=list)
    requirements_not_met: List[str] = Field(default_factory=list)
    assessment_objectives_status: Dict[str, bool] = Field(default_factory=dict)
    recommendations: List[str] = Field(default_factory=list)
    nist_guidance_applied: bool = False


class OSCALValidationResult(BaseModel):
    """OSCAL document validation result"""
    is_valid: bool
    document_type: str  # ssp, poam, assessment-results, etc.
    oscal_version: str = "1.2.0"
    error_count: int = 0
    warning_count: int = 0
    validation_messages: List[str] = Field(default_factory=list)


class RemediationTask(BaseModel):
    """Actionable remediation task"""
    task_id: str
    title: str
    description: str
    priority: RiskLevel
    effort_estimate: str  # low, medium, high
    related_gaps: List[str]
    implementation_guide: str
    code_snippets: List[Dict[str, str]] = Field(default_factory=list)  # {language: code}
    verification_steps: List[str]


class AssessmentScopeRequest(BaseModel):
    """User's assessment scope configuration"""
    baseline: BaselineLevel = Field(
        default=BaselineLevel.MODERATE,
        description="NIST baseline to assess against"
    )
    control_families: Optional[List[str]] = Field(
        default=None,
        description="Control families to include (e.g., ['AC', 'AU'])"
    )
    specific_controls: Optional[List[str]] = Field(
        default=None,
        description="Specific controls to assess (e.g., ['AC-2', 'AU-6'])"
    )
    mode: AssessmentMode = Field(
        default=AssessmentMode.SMART,
        description="Assessment depth mode"
    )
    predefined_scope: Optional[str] = Field(
        default=None,
        description="Pre-defined scope name (e.g., 'cloud_security')"
    )
    
    @field_validator('specific_controls')
    @classmethod
    def validate_specific_controls(cls, v):
        """Validate specific control IDs format and prevent empty list"""
        if v is None:
            return v
        
        # Convert empty list to None (prevents filtering to zero controls)
        if isinstance(v, list) and len(v) == 0:
            return None
        
        # Validate each control ID format
        control_pattern = re.compile(r'^[A-Z]{2,3}-\d+(\(\d+\))?$')
        invalid_controls = [ctrl for ctrl in v if not control_pattern.match(ctrl)]
        
        if invalid_controls:
            raise ValueError(
                f"Invalid control ID format: {', '.join(invalid_controls)}. "
                f"Expected format: XX-N or XXX-N (e.g., 'AC-2', 'AC-2(1)', 'PII-1')"
            )
        
        return v


class ProcessingEstimate(BaseModel):
    """Estimated processing metrics for scope configuration"""
    control_count: int
    estimated_tokens: int
    estimated_minutes: float
    estimated_cost_usd: float
    mode: str


class AnalysisResult(BaseModel):
    """Complete analysis result from the multi-agent system (OSCAL 1.2.0 compliant)"""
    session_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Agent 1: Evidence Analysis
    evidence_artifacts: List[EvidenceArtifact]
    
    # Agent 2: Control Mapping & Gap Analysis
    control_mappings: List[ControlMapping]
    control_gaps: List[ControlGap]
    
    # Agent 3: OSCAL Generation
    oscal_components: List[OSCALComponent]
    poam_entries: List[POAMEntry]
    
    # Agent 4: NIST Validation
    nist_validation_results: List[NISTValidationResult] = Field(default_factory=list)
    oscal_validation_result: Optional[OSCALValidationResult] = None
    
    # Agent 5: Remediation Planning (with Gemini 3 reasoning)
    remediation_tasks: List[RemediationTask]
    
    # Assessment Scope Metadata
    assessment_scope: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Scope configuration used for this assessment"
    )
    
    # Summary Statistics
    total_controls_analyzed: int
    implemented_controls: int
    gaps_identified: int
    critical_gaps: int
    overall_compliance_score: float = Field(ge=0.0, le=100.0)


class ProcessingStatus(BaseModel):
    """Real-time processing status"""
    session_id: str
    stage: str  # uploading, processing, analyzing, mapping, generating, complete, error
    progress: int = Field(ge=0, le=100)
    current_step: str
    message: str
    error: Optional[str] = None
