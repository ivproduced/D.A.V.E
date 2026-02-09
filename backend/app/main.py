from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict
from dataclasses import dataclass, field
import uuid
import asyncio
import json
import time
from datetime import datetime

from app.config import get_settings
from app.models import ProcessingStatus, AnalysisResult, AssessmentScopeRequest, ProcessingEstimate, RiskLevel
from app.utils.document_processor import DocumentProcessor
from app.services.gemini_service import GeminiService
from app.services.baseline_service import BaselineService, AssessmentScope
from app.services.nist_catalog_service import get_nist_catalog_service

# ============================================================================
# Processing Metrics Tracking (Task 14)
# ============================================================================

@dataclass
class ProcessingMetrics:
    """Track optimization metrics during assessment processing"""
    session_id: str
    start_time: float = field(default_factory=time.time)
    end_time: Optional[float] = None
    
    # Scope metrics
    baseline: str = "all"
    assessment_mode: str = "deep"
    controls_in_scope: int = 0
    
    # Processing metrics
    total_controls: int = 0
    controls_validated: int = 0
    controls_skipped: int = 0
    critical_controls: int = 0
    standard_controls: int = 0
    passing_controls: int = 0
    
    # API metrics
    api_calls_made: int = 0
    api_calls_batch: int = 0
    api_calls_individual: int = 0
    
    # Performance metrics
    tokens_used: int = 0
    tokens_estimated: int = 0
    cache_hit_rate: float = 0.0
    
    # Results
    gaps_found: int = 0
    critical_gaps: int = 0
    
    def finish(self):
        """Mark processing as complete and calculate duration"""
        self.end_time = time.time()
    
    def duration_seconds(self) -> float:
        """Get processing duration in seconds"""
        if self.end_time:
            return self.end_time - self.start_time
        return time.time() - self.start_time
    
    def duration_minutes(self) -> float:
        """Get processing duration in minutes"""
        return self.duration_seconds() / 60
    
    def token_efficiency(self) -> float:
        """Calculate token efficiency (actual vs estimated)"""
        if self.tokens_estimated > 0:
            return (1 - (self.tokens_used / self.tokens_estimated)) * 100
        return 0.0
    
    def to_dict(self) -> dict:
        """Convert to dictionary for logging"""
        return {
            "session_id": self.session_id,
            "duration_minutes": round(self.duration_minutes(), 2),
            "scope": {
                "baseline": self.baseline,
                "mode": self.assessment_mode,
                "controls_in_scope": self.controls_in_scope
            },
            "processing": {
                "total_controls": self.total_controls,
                "validated": self.controls_validated,
                "skipped": self.controls_skipped,
                "prioritization": {
                    "critical": self.critical_controls,
                    "standard": self.standard_controls,
                    "passing": self.passing_controls
                }
            },
            "api_usage": {
                "total_calls": self.api_calls_made,
                "batch_calls": self.api_calls_batch,
                "individual_calls": self.api_calls_individual,
                "average_controls_per_call": round(self.total_controls / self.api_calls_made, 2) if self.api_calls_made > 0 else 0
            },
            "performance": {
                "tokens_used": self.tokens_used,
                "tokens_estimated": self.tokens_estimated,
                "token_efficiency_percent": round(self.token_efficiency(), 2),
                "cache_hit_rate_percent": round(self.cache_hit_rate * 100, 2)
            },
            "results": {
                "gaps_found": self.gaps_found,
                "critical_gaps": self.critical_gaps
            }
        }

# Store metrics for each session
processing_metrics = {}

# ============================================================================
# FastAPI Application Setup
# ============================================================================

# Initialize FastAPI app
app = FastAPI(
    title="D.A.V.E - Document Analysis & Validation Engine",
    description="AI-Powered Compliance Automation using Google Gemini",
    version="0.1.0"
)

# Settings
settings = get_settings()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
document_processor = DocumentProcessor()
gemini_service = GeminiService()
baseline_service = BaselineService()
nist_catalog_service = get_nist_catalog_service()

# In-memory storage for demo (use Redis/DB in production)
processing_sessions = {}
analysis_results = {}


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "D.A.V.E - Document Analysis & Validation Engine",
        "status": "operational",
        "version": "0.1.0",
        "powered_by": "Google Gemini"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "operational",
            "gemini": "operational"
        }
    }


# ============================================================================
# Baseline and Scope Selection API Endpoints
# ============================================================================

@app.get("/api/baselines")
async def get_baselines():
    """
    Get available NIST 800-53 baselines
    
    Returns baseline definitions with control counts:
    - low: 53 controls (minimum recommended baseline)
    - moderate: 325 controls (most common for federal systems)
    - high: 421 controls (high impact systems)
    - custom: User-defined control selection
    - all: All 1,191 controls from NIST 800-53 Rev 5
    """
    try:
        baselines = {
            "low": {
                "name": "Low Baseline",
                "description": "Minimum baseline for low-impact systems",
                "control_count": 53,
                "families_included": ["AC", "AT", "AU", "CA", "CM", "CP", "IA", "IR", "MA", "MP", "PE", "PL", "PS", "SA", "SC", "SI"],
                "recommended_for": "Low-impact systems, development environments, internal tools"
            },
            "moderate": {
                "name": "Moderate Baseline",
                "description": "Standard baseline for moderate-impact systems (Low + enhancements)",
                "control_count": 325,
                "families_included": ["AC", "AT", "AU", "CA", "CM", "CP", "IA", "IR", "MA", "MP", "PE", "PL", "PS", "RA", "SA", "SC", "SI", "SR"],
                "recommended_for": "Most federal systems, financial services, healthcare applications"
            },
            "high": {
                "name": "High Baseline",
                "description": "Comprehensive baseline for high-impact systems (Moderate + enhancements)",
                "control_count": 421,
                "families_included": ["AC", "AT", "AU", "CA", "CM", "CP", "IA", "IR", "MA", "MP", "PE", "PL", "PS", "RA", "SA", "SC", "SI", "SR"],
                "recommended_for": "High-impact systems, national security systems, critical infrastructure"
            },
            "custom": {
                "name": "Custom Selection",
                "description": "User-defined control selection",
                "control_count": 0,
                "families_included": [],
                "recommended_for": "Specific compliance requirements, targeted assessments, control subset validation"
            },
            "all": {
                "name": "All Controls",
                "description": "Complete NIST 800-53 Rev 5 catalog",
                "control_count": 1191,
                "families_included": ["AC", "AT", "AU", "CA", "CM", "CP", "IA", "IR", "MA", "MP", "PE", "PL", "PM", "PS", "PT", "RA", "SA", "SC", "SI", "SR"],
                "recommended_for": "Comprehensive assessments, full catalog validation, research purposes"
            }
        }
        return baselines
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/control-families")
async def get_control_families():
    """
    Get all NIST 800-53 control families with metadata
    
    Returns family codes, names, and control counts for filtering
    """
    try:
        families = baseline_service.get_control_families()
        return {"families": families}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/controls")
async def get_controls(family: Optional[str] = None):
    """
    Get controls, optionally filtered by family
    
    Args:
        family: Optional family code (e.g., 'AC', 'AU') to filter controls
    
    Returns:
        List of controls with id and title
    """
    try:
        nist_service = get_nist_catalog_service()
        
        if family:
            controls = nist_service.get_controls_by_family(family)
        else:
            all_controls = nist_service.get_all_controls()
            controls = [{"id": c.id, "title": c.title, "family_code": c.family} for c in all_controls]
        
        return {"controls": controls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/predefined-scopes")
async def get_predefined_scopes():
    """
    Get predefined assessment scopes
    
    Returns common control groupings:
    - cloud_security: AC, IA, SC, AU, CM (cloud infrastructure focus)
    - identity_access: AC, IA, AU (identity and access management)
    - audit_logging: AU, SI, IR (audit and monitoring)
    - data_protection: SC, MP, PE (data security and privacy)
    - incident_response: IR, CP, AU (incident handling)
    - technical_only: All technical families excluding policy/procedure
    """
    try:
        scopes = baseline_service.get_predefined_scopes()
        return {"scopes": scopes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/estimate-scope")
async def estimate_scope(scope_request: AssessmentScopeRequest):
    """
    Estimate processing requirements for a given scope
    
    Accepts: AssessmentScopeRequest with baseline, control families, mode
    Returns: ProcessingEstimate with control count, tokens, time, cost
    
    Assessment modes:
    - quick: Batch validation (200 tokens/control, ~1 sec/control)
    - smart: Selective deep reasoning (1000 tokens/control, ~2 sec/control)
    - deep: Full reasoning for all (8000 tokens/control, ~5 sec/control)
    """
    try:
        # Validate scope configuration
        # Treat empty array as "all families" (same as None)
        if scope_request.control_families is not None and len(scope_request.control_families) == 0:
            scope_request.control_families = None
        
        if scope_request.control_families is not None:
            # Validate family codes
            valid_families = {"AC", "AT", "AU", "CA", "CM", "CP", "IA", "IR", "MA", "MP", 
                            "PE", "PL", "PM", "PS", "PT", "RA", "SA", "SC", "SI", "SR"}
            invalid_families = set(scope_request.control_families) - valid_families
            if invalid_families:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid control families: {', '.join(invalid_families)}. Valid families are: {', '.join(sorted(valid_families))}"
                )
        
        # Get all control IDs from catalog
        all_control_ids = nist_catalog_service.get_all_control_ids()
        
        # Create AssessmentScope object
        scope = AssessmentScope(
            baseline=scope_request.baseline,
            control_families=scope_request.control_families,
            specific_controls=scope_request.specific_controls,
            mode=scope_request.mode
        )
        
        # Filter controls based on scope
        filtered_controls = baseline_service.filter_controls(
            all_control_ids=all_control_ids,
            scope=scope
        )
        
        # Validate that filtering resulted in at least some controls
        if len(filtered_controls) == 0:
            raise HTTPException(
                status_code=400,
                detail="The specified scope resulted in zero controls. Please adjust your baseline, families, or specific controls selection."
            )
        
        # Calculate estimate (pass count, not list)
        estimate = baseline_service.estimate_processing(
            control_count=len(filtered_controls),
            mode=scope_request.mode
        )
        
        return estimate
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Document Processing Endpoints
# ============================================================================


@app.post("/api/analyze")
async def analyze_documents(
    files: List[UploadFile] = File(...),
    scope_json: Optional[str] = Form(None)
):
    """
    Upload and analyze compliance evidence documents with optional scope filtering
    
    Accepts:
    - files: Multiple files (PDF, DOCX, images, config files)
    - scope_json: Optional JSON string with AssessmentScopeRequest for filtering
    
    Returns a session ID for tracking progress
    
    Scope filtering enables:
    - Baseline selection (low/moderate/high) to focus on specific control sets
    - Control family filtering (AC, AU, IA, etc.)
    - Assessment mode (quick/smart/deep) for performance tuning
    - Predefined scopes (cloud_security, identity_access, etc.)
    """
    try:
        # Validate file uploads
        if not files or len(files) == 0:
            raise HTTPException(status_code=400, detail="No files provided")
        
        if len(files) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 files allowed per upload")
        
        # Validate and read all files into memory before background processing
        file_data = []
        for file in files:
            # Check file size
            file_content = await file.read()
            
            if len(file_content) > settings.max_upload_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"File {file.filename} exceeds maximum size of {settings.max_upload_size / (1024*1024)}MB"
                )
            
            # Check file type
            if file.content_type not in settings.allowed_file_types:
                raise HTTPException(
                    status_code=415,
                    detail=f"File type {file.content_type} not allowed. Supported types: PDF, DOCX, PNG, JPEG, JSON, YAML, TXT"
                )
            
            # Store file data for background processing
            file_data.append({
                'content': file_content,
                'filename': file.filename,
                'content_type': file.content_type
            })
        
        # Parse scope configuration if provided
        scope_request = None
        if scope_json:
            try:
                scope_data = json.loads(scope_json)
                scope_request = AssessmentScopeRequest(**scope_data)
            except Exception as e:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid scope configuration: {str(e)}"
                )
        
        # Create new session
        session_id = str(uuid.uuid4())
        
        # Initialize session status BEFORE starting background task
        status = ProcessingStatus(
            session_id=session_id,
            stage="initializing",
            progress=1,
            current_step="Initializing",
            message="Starting AI agent processing pipeline..."
        )
        processing_sessions[session_id] = status
        
        # Process files in background with scope filtering
        asyncio.create_task(process_documents_async(session_id, file_data, scope_request))
        
        return {
            "session_id": session_id,
            "status": "processing",
            "message": f"Processing {len(file_data)} files",
            "files_received": len(file_data),
            "scope_applied": scope_request is not None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def process_documents_async(
    session_id: str, 
    file_data: List[Dict[str, any]],
    scope_request: Optional[AssessmentScopeRequest] = None
):
    """
    Background task to process documents through the enhanced 5-agent pipeline
    with optional scope filtering and assessment mode optimization
    """
    # Immediately update status to show we've started
    update_status(session_id, "initializing", 1, "Initializing AI agents and processing pipeline...")
    
    # Initialize metrics tracking
    metrics = ProcessingMetrics(session_id=session_id)
    processing_metrics[session_id] = metrics
    
    try:
        # Step 0: Apply scope filtering if provided
        filtered_control_ids = None
        assessment_mode = "deep"  # default mode
        
        if scope_request:
            update_status(session_id, "scoping", 5, "Applying assessment scope filters")
            
            # Get all control IDs from catalog
            all_control_ids = nist_catalog_service.get_all_control_ids()
            
            # Create AssessmentScope object
            scope = AssessmentScope(
                baseline=scope_request.baseline,
                control_families=scope_request.control_families,
                specific_controls=scope_request.specific_controls,
                mode=scope_request.mode
            )
            
            # Filter controls based on scope configuration
            filtered_control_ids = baseline_service.filter_controls(
                all_control_ids=all_control_ids,
                scope=scope
            )
            
            assessment_mode = scope_request.mode.value if scope_request.mode else "deep"
            
            # Track scope metrics
            metrics.baseline = scope_request.baseline.value if scope_request.baseline else "all"
            metrics.assessment_mode = assessment_mode
            metrics.controls_in_scope = len(filtered_control_ids) if filtered_control_ids else 0
            
            # Get estimate for token tracking
            estimate = baseline_service.estimate_processing(
                control_count=len(filtered_control_ids),
                mode=assessment_mode
            )
            metrics.tokens_estimated = estimate["estimated_tokens"]
            
            update_status(
                session_id, 
                "scoping", 
                8, 
                f"Scope applied: {len(filtered_control_ids)} controls, {assessment_mode} mode"
            )
        
        # Update status: Processing documents
        update_status(session_id, "processing", 10, "Processing uploaded documents")
        
        # Step 1: Process all uploaded files with progress updates
        processed_files = []
        total_files = len(file_data)
        for idx, file_info in enumerate(file_data):
            # Update progress for each file
            file_progress = 10 + int((idx / total_files) * 8)  # Progress from 10% to 18%
            update_status(session_id, "processing", file_progress, f"Processing file {idx+1}/{total_files}: {file_info['filename']}")
            
            result = document_processor.process_file(
                file_info['content'], 
                file_info['filename'],
                file_info['content_type']
            )
            result['filename'] = file_info['filename']
            processed_files.append(result)
        
        update_status(session_id, "analyzing", 20, "Agent 1: Analyzing evidence with Gemini 3...")
        
        # Step 2: Agent 1 - Evidence Analysis
        print(f"[{session_id}] 🤖 CALLING GEMINI API: analyze_evidence with {len(processed_files)} files")
        update_status(session_id, "analyzing", 25, "Agent 1: AI extracting security controls and policies...")
        evidence_artifacts = await gemini_service.analyze_evidence(processed_files)
        print(f"[{session_id}] ✅ GEMINI RESPONSE: {len(evidence_artifacts)} evidence artifacts created")
        update_status(session_id, "analyzing", 30, f"Agent 1: Completed - {len(evidence_artifacts)} evidence artifacts identified")
        
        update_status(session_id, "mapping", 35, "Agent 2: Mapping controls to NIST 800-53...")
        
        # Step 3: Agent 2 - Control Mapping & Gap Analysis
        # If scope filtering is active, only map controls in scope
        print(f"[{session_id}] 🤖 CALLING GEMINI API: map_controls_and_gaps with {len(evidence_artifacts)} artifacts")
        update_status(session_id, "mapping", 38, "Agent 2: AI analyzing control implementations...")
        control_mappings, control_gaps = await gemini_service.map_controls_and_gaps(
            evidence_artifacts,
            control_filter=filtered_control_ids  # Pass filtered controls
        )
        print(f"[{session_id}] ✅ GEMINI RESPONSE: {len(control_mappings)} mappings, {len(control_gaps)} gaps")
        update_status(session_id, "mapping", 45, f"Agent 2: Completed - {len(control_mappings)} controls mapped, {len(control_gaps)} gaps identified")
        
        # Track metrics
        metrics.total_controls = len(control_mappings)
        metrics.gaps_found = len(control_gaps)
        metrics.critical_gaps = sum(1 for g in control_gaps if g.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL])
        
        update_status(session_id, "generating", 50, "Agent 3: Generating OSCAL 1.2.0 artifacts...")
        
        # Step 4: Agent 3 - OSCAL Generation
        print(f"[{session_id}] 🤖 CALLING GEMINI API: generate_oscal_artifacts")
        update_status(session_id, "generating", 53, "Agent 3: AI creating System Security Plan components...")
        oscal_components, poam_entries = await gemini_service.generate_oscal_artifacts(
            control_mappings,
            control_gaps,
            evidence_artifacts
        )
        print(f"[{session_id}] ✅ GEMINI RESPONSE: {len(oscal_components)} components, {len(poam_entries)} POAM entries")
        update_status(session_id, "generating", 60, f"Agent 3: Completed - {len(oscal_components)} SSP components, {len(poam_entries)} POA&M entries")
        
        update_status(session_id, "validating_nist", 65, "Agent 4: Validating against NIST 800-53 Rev 5...")
        
        # Step 5: Agent 4 - NIST Validation with mode-specific optimization
        if assessment_mode == "quick":
            # Quick mode: Use batch validation for all controls
            update_status(session_id, "validating_nist", 65, "Quick validation: Batch processing controls")
            control_ids = [m.control_id for m in control_mappings]
            nist_validation_results = await gemini_service.validate_controls_batch(
                control_ids,
                evidence_artifacts,
                batch_size=settings.batch_validation_size
            )
            metrics.controls_validated = len(control_ids)
            metrics.api_calls_batch = len(control_ids) // settings.batch_validation_size + 1
            metrics.api_calls_made = metrics.api_calls_batch
            
        elif assessment_mode == "smart":
            # Smart mode: Prioritize and use selective validation
            update_status(session_id, "validating_nist", 65, "Smart validation: Prioritizing controls")
            prioritized = gemini_service.prioritize_controls(control_mappings, control_gaps)
            
            # Track prioritization
            metrics.critical_controls = len(prioritized["critical"])
            metrics.standard_controls = len(prioritized["standard"])
            metrics.passing_controls = len(prioritized["passing"])
            
            # Batch validate standard controls
            standard_results = []
            if prioritized["standard"]:
                standard_results = await gemini_service.validate_controls_batch(
                    prioritized["standard"],
                    evidence_artifacts,
                    batch_size=settings.batch_validation_size
                )
                metrics.api_calls_batch += len(prioritized["standard"]) // settings.batch_validation_size + 1
            
            # Deep validate critical controls (use existing detailed validation)
            critical_results = []
            for control_id in prioritized["critical"]:
                mapping = next((m for m in control_mappings if m.control_id == control_id), None)
                if mapping:
                    result = await gemini_service.validate_against_nist_requirements(
                        [mapping],
                        evidence_artifacts
                    )
                    critical_results.extend(result)
                    metrics.api_calls_individual += 1
            
            # Skip passing controls if configured
            passing_results = []
            if not settings.skip_passing_controls and prioritized["passing"]:
                passing_results = await gemini_service.validate_controls_batch(
                    prioritized["passing"],
                    evidence_artifacts,
                    batch_size=settings.batch_validation_size
                )
                metrics.api_calls_batch += len(prioritized["passing"]) // settings.batch_validation_size + 1
            else:
                metrics.controls_skipped = len(prioritized["passing"])
            
            metrics.controls_validated = len(prioritized["critical"]) + len(prioritized["standard"]) + len(passing_results)
            metrics.api_calls_made = metrics.api_calls_batch + metrics.api_calls_individual
            
            nist_validation_results = standard_results + critical_results + passing_results
        else:
            # Deep mode: Full validation for all (existing behavior)
            nist_validation_results = await gemini_service.validate_against_nist_requirements(
                control_mappings,
                evidence_artifacts
            )
            metrics.controls_validated = len(control_mappings)
            metrics.api_calls_individual = len(control_mappings)
            metrics.api_calls_made = metrics.api_calls_individual
        
        update_status(session_id, "validating_oscal", 75, "Validating OSCAL artifacts with OSCAL-CLI")
        
        # Step 6: OSCAL Validation
        oscal_validation_result = await gemini_service.validate_oscal_artifacts(
            oscal_components,
            poam_entries
        )
        
        update_status(session_id, "planning", 85, "Agent 5: Generating remediation recommendations...")
        
        # Step 7: Agent 5 - Remediation Planning with mode-specific optimization
        if assessment_mode == "quick":
            # Quick mode: Use lightweight batch remediation
            update_status(session_id, "planning", 87, "Quick mode: AI generating concise recommendations...")
            remediation_tasks = await gemini_service._batch_remediation(
                control_gaps,
                evidence_artifacts,
                batch_size=settings.batch_remediation_size
            )
        elif assessment_mode == "smart":
            # Smart mode: Deep reasoning only for high/critical gaps
            update_status(session_id, "planning", 87, "Smart mode: AI prioritizing critical gaps...")
            
            # Separate high/critical gaps from others
            critical_gaps = [g for g in control_gaps if g.risk_level in settings.deep_reasoning_risk_levels]
            standard_gaps = [g for g in control_gaps if g.risk_level not in settings.deep_reasoning_risk_levels]
            
            # Deep reasoning for critical gaps
            critical_tasks = []
            if critical_gaps:
                update_status(session_id, "planning", 88, f"Smart mode: Deep reasoning for {len(critical_gaps)} critical gaps...")
                critical_tasks = await gemini_service.generate_recommendations_with_reasoning(
                    critical_gaps,
                    nist_validation_results,
                    evidence_artifacts
                )
            
            # Batch remediation for standard gaps
            standard_tasks = []
            if standard_gaps:
                standard_tasks = await gemini_service._batch_remediation(
                    standard_gaps,
                    evidence_artifacts,
                    batch_size=settings.batch_remediation_size
                )
            
            remediation_tasks = critical_tasks + standard_tasks
        else:
            # Deep mode: Full reasoning for all (existing behavior)
            update_status(session_id, "planning", 87, f"Deep mode: AI generating detailed recommendations for {len(control_gaps)} gaps...")
            remediation_tasks = await gemini_service.generate_recommendations_with_reasoning(
                control_gaps,
                nist_validation_results,
                evidence_artifacts
            )
        
        update_status(session_id, "finalizing", 93, f"Finalizing {len(remediation_tasks)} remediation tasks...")
        
        # Build assessment scope metadata if filtering was applied
        assessment_scope = None
        if scope_request:
            assessment_scope = {
                "baseline": scope_request.baseline.value if scope_request.baseline else "all",
                "control_families": scope_request.control_families or [],
                "mode": assessment_mode,
                "controls_in_scope": len(filtered_control_ids) if filtered_control_ids else len(control_mappings),
                "controls_processed": len(control_mappings),
                "predefined_scope": scope_request.predefined_scope
            }
        
        # Create final analysis result with all validation data
        result = AnalysisResult(
            session_id=session_id,
            evidence_artifacts=evidence_artifacts,
            control_mappings=control_mappings,
            control_gaps=control_gaps,
            oscal_components=oscal_components,
            poam_entries=poam_entries,
            nist_validation_results=nist_validation_results,
            oscal_validation_result=oscal_validation_result,
            remediation_tasks=remediation_tasks,
            total_controls_analyzed=len(control_mappings),
            implemented_controls=sum(1 for m in control_mappings if m.implementation_status == "implemented"),
            gaps_identified=len(control_gaps),
            critical_gaps=sum(1 for g in control_gaps if g.risk_level == "critical"),
            overall_compliance_score=calculate_compliance_score(control_mappings, control_gaps),
            assessment_scope=assessment_scope
        )
        
        # Store result
        analysis_results[session_id] = result
        
        # Finalize metrics and log
        metrics.finish()
        print(f"\n{'='*80}")
        print(f"PROCESSING METRICS - Session {session_id}")
        print(f"{'='*80}")
        print(json.dumps(metrics.to_dict(), indent=2))
        print(f"{'='*80}\n")
        
        update_status(session_id, "complete", 100, "Analysis complete with NIST & OSCAL validation!")
        
    except Exception as e:
        error_msg = f"Error during processing: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        
        # Log metrics even on error
        if session_id in processing_metrics:
            metrics = processing_metrics[session_id]
            metrics.finish()
            print(f"\nMetrics before error: {json.dumps(metrics.to_dict(), indent=2)}\n")
        
        update_status(session_id, "error", 0, error_msg, error=str(e))


def update_status(session_id: str, stage: str, progress: int, message: str, error: str = None):
    """Helper to update processing status"""
    status = ProcessingStatus(
        session_id=session_id,
        stage=stage,
        progress=progress,
        current_step=stage.capitalize(),
        message=message,
        error=error
    )
    processing_sessions[session_id] = status


def calculate_compliance_score(mappings: List, gaps: List) -> float:
    """Calculate overall compliance score"""
    if not mappings:
        return 0.0
    
    implemented = sum(1 for m in mappings if m.implementation_status == "implemented")
    total = len(mappings) + len(gaps)
    
    if total == 0:
        return 0.0
    
    score = (implemented / total) * 100
    return round(score, 2)


@app.get("/api/status/{session_id}")
async def get_status(session_id: str):
    """Get processing status for a session"""
    if session_id not in processing_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return processing_sessions[session_id]


@app.get("/api/results/{session_id}")
async def get_results(session_id: str):
    """Get analysis results for a completed session"""
    if session_id not in analysis_results:
        # Check if still processing
        if session_id in processing_sessions:
            status = processing_sessions[session_id]
            if status.stage != "complete":
                raise HTTPException(
                    status_code=202, 
                    detail=f"Analysis still in progress: {status.stage}"
                )
        raise HTTPException(status_code=404, detail="Results not found")
    
    return analysis_results[session_id]


@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    """
    Clean up session data to prevent memory leaks
    
    Removes session from processing_sessions, processing_metrics, and analysis_results.
    Should be called after downloading results or when session is no longer needed.
    """
    deleted = []
    
    if session_id in processing_sessions:
        del processing_sessions[session_id]
        deleted.append("processing_status")
    
    if session_id in processing_metrics:
        del processing_metrics[session_id]
        deleted.append("metrics")
    
    if session_id in analysis_results:
        del analysis_results[session_id]
        deleted.append("results")
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "deleted": deleted,
        "message": f"Session cleaned up successfully. Deleted: {', '.join(deleted)}"
    }


@app.get("/api/results/{session_id}/oscal")
async def download_oscal(session_id: str):
    """Download OSCAL artifacts as JSON"""
    if session_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Results not found")
    
    result = analysis_results[session_id]
    
    oscal_output = {
        "system-security-plan": {
            "metadata": {
                "title": "D.A.V.E Generated SSP",
                "last-modified": datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "oscal-version": "1.2.0"
            },
            "components": [c.dict() for c in result.oscal_components]
        },
        "plan-of-action-and-milestones": {
            "metadata": {
                "title": "D.A.V.E Generated POA&M",
                "last-modified": datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "oscal-version": "1.2.0"
            },
            "poam-items": [p.dict() for p in result.poam_entries]
        }
    }
    
    return JSONResponse(content=oscal_output)


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket for real-time status updates with session validation"""
    # Validate session exists before accepting connection
    if session_id not in processing_sessions:
        await websocket.close(code=4004, reason="Session not found")
        return
    
    await websocket.accept()
    
    try:
        while True:
            if session_id in processing_sessions:
                status = processing_sessions[session_id]
                await websocket.send_json(status.dict())
                
                # Stop if complete or error
                if status.stage in ["complete", "error"]:
                    break
            
            await asyncio.sleep(1)  # Update every second
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
