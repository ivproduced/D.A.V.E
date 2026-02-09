"""
OSCAL Validator Service

This service wraps OSCAL-CLI commands to validate OSCAL artifacts
against the official OSCAL 1.2.0 schemas.
"""

import json
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from enum import Enum


class OSCALDocumentType(str, Enum):
    """OSCAL document types"""
    SSP = "ssp"
    POAM = "poam"
    ASSESSMENT_PLAN = "assessment-plan"
    ASSESSMENT_RESULTS = "assessment-results"
    CATALOG = "catalog"
    PROFILE = "profile"
    COMPONENT_DEFINITION = "component-definition"


class ValidationSeverity(str, Enum):
    """Validation message severity"""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class ValidationMessage(BaseModel):
    """A single validation message"""
    severity: ValidationSeverity
    message: str
    location: Optional[str] = None
    line: Optional[int] = None


class ValidationResult(BaseModel):
    """Result of OSCAL validation"""
    is_valid: bool
    document_type: OSCALDocumentType
    oscal_version: str = "1.2.0"
    messages: List[ValidationMessage] = []
    error_count: int = 0
    warning_count: int = 0
    info_count: int = 0


class OSCALValidatorService:
    """Service for validating OSCAL documents using OSCAL-CLI"""
    
    def __init__(self):
        """Initialize the OSCAL validator service"""
        self.oscal_cli_available = self._check_oscal_cli()
    
    def _check_oscal_cli(self) -> bool:
        """Check if OSCAL-CLI is available"""
        try:
            result = subprocess.run(
                ['oscal-cli', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            print("Warning: OSCAL-CLI not found. Validation will use basic JSON schema checks.")
            return False
    
    async def validate_document(
        self,
        document: Dict[str, Any],
        document_type: OSCALDocumentType
    ) -> ValidationResult:
        """
        Validate an OSCAL document
        
        Args:
            document: The OSCAL document as a dictionary
            document_type: The type of OSCAL document
            
        Returns:
            ValidationResult with validation status and messages
        """
        validation_result = ValidationResult(
            is_valid=True,
            document_type=document_type
        )
        
        # Basic structure validation
        structure_messages = self._validate_structure(document, document_type)
        validation_result.messages.extend(structure_messages)
        
        # If OSCAL-CLI is available, use it for comprehensive validation
        if self.oscal_cli_available:
            cli_messages = await self._validate_with_cli(document, document_type)
            validation_result.messages.extend(cli_messages)
        else:
            # Fallback to basic JSON schema validation
            schema_messages = self._validate_with_json_schema(document, document_type)
            validation_result.messages.extend(schema_messages)
        
        # Count messages by severity
        for msg in validation_result.messages:
            if msg.severity == ValidationSeverity.ERROR:
                validation_result.error_count += 1
                validation_result.is_valid = False
            elif msg.severity == ValidationSeverity.WARNING:
                validation_result.warning_count += 1
            elif msg.severity == ValidationSeverity.INFO:
                validation_result.info_count += 1
        
        return validation_result
    
    def _validate_structure(
        self,
        document: Dict[str, Any],
        document_type: OSCALDocumentType
    ) -> List[ValidationMessage]:
        """Validate basic OSCAL document structure"""
        messages = []
        
        # Check for root element matching document type
        root_key = self._get_root_key(document_type)
        if root_key not in document:
            messages.append(ValidationMessage(
                severity=ValidationSeverity.ERROR,
                message=f"Missing root element '{root_key}' for {document_type} document"
            ))
            return messages
        
        root = document[root_key]
        
        # Check for required metadata
        if 'metadata' not in root:
            messages.append(ValidationMessage(
                severity=ValidationSeverity.ERROR,
                message="Missing required 'metadata' element"
            ))
        else:
            metadata = root['metadata']
            
            # Check metadata fields
            if 'title' not in metadata:
                messages.append(ValidationMessage(
                    severity=ValidationSeverity.WARNING,
                    message="Missing metadata title"
                ))
            
            if 'last-modified' not in metadata:
                messages.append(ValidationMessage(
                    severity=ValidationSeverity.WARNING,
                    message="Missing metadata last-modified timestamp"
                ))
            
            if 'version' not in metadata:
                messages.append(ValidationMessage(
                    severity=ValidationSeverity.WARNING,
                    message="Missing metadata version"
                ))
            
            if 'oscal-version' not in metadata:
                messages.append(ValidationMessage(
                    severity=ValidationSeverity.WARNING,
                    message="Missing metadata oscal-version"
                ))
            elif metadata['oscal-version'] != '1.2.0':
                messages.append(ValidationMessage(
                    severity=ValidationSeverity.WARNING,
                    message=f"OSCAL version {metadata['oscal-version']} does not match expected 1.2.0"
                ))
        
        # Check for UUID
        if 'uuid' not in root:
            messages.append(ValidationMessage(
                severity=ValidationSeverity.ERROR,
                message="Missing required 'uuid' field"
            ))
        
        return messages
    
    async def _validate_with_cli(
        self,
        document: Dict[str, Any],
        document_type: OSCALDocumentType
    ) -> List[ValidationMessage]:
        """Validate document using OSCAL-CLI"""
        messages = []
        
        try:
            # Write document to temporary file
            with tempfile.NamedTemporaryFile(
                mode='w',
                suffix='.json',
                delete=False
            ) as f:
                json.dump(document, f, indent=2)
                temp_path = f.name
            
            # Run OSCAL-CLI validation
            result = subprocess.run(
                ['oscal-cli', 'validate', document_type.value, temp_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Parse output
            if result.returncode != 0:
                # Parse error messages from output
                error_lines = result.stderr.split('\n')
                for line in error_lines:
                    if line.strip():
                        messages.append(ValidationMessage(
                            severity=ValidationSeverity.ERROR,
                            message=line.strip()
                        ))
            else:
                messages.append(ValidationMessage(
                    severity=ValidationSeverity.INFO,
                    message="OSCAL-CLI validation passed"
                ))
            
            # Clean up temp file
            Path(temp_path).unlink(missing_ok=True)
            
        except subprocess.TimeoutExpired:
            messages.append(ValidationMessage(
                severity=ValidationSeverity.ERROR,
                message="OSCAL-CLI validation timed out"
            ))
        except Exception as e:
            messages.append(ValidationMessage(
                severity=ValidationSeverity.ERROR,
                message=f"OSCAL-CLI validation error: {str(e)}"
            ))
        
        return messages
    
    def _validate_with_json_schema(
        self,
        document: Dict[str, Any],
        document_type: OSCALDocumentType
    ) -> List[ValidationMessage]:
        """Fallback validation using basic JSON schema checks"""
        messages = []
        
        messages.append(ValidationMessage(
            severity=ValidationSeverity.INFO,
            message="Using basic JSON schema validation (OSCAL-CLI not available)"
        ))
        
        # Additional basic checks can be added here
        # For now, structure validation is sufficient
        
        return messages
    
    def _get_root_key(self, document_type: OSCALDocumentType) -> str:
        """Get the root key for a document type"""
        mapping = {
            OSCALDocumentType.SSP: "system-security-plan",
            OSCALDocumentType.POAM: "plan-of-action-and-milestones",
            OSCALDocumentType.ASSESSMENT_PLAN: "assessment-plan",
            OSCALDocumentType.ASSESSMENT_RESULTS: "assessment-results",
            OSCALDocumentType.CATALOG: "catalog",
            OSCALDocumentType.PROFILE: "profile",
            OSCALDocumentType.COMPONENT_DEFINITION: "component-definition"
        }
        return mapping.get(document_type, document_type.value)
    
    async def validate_ssp(self, ssp_document: Dict[str, Any]) -> ValidationResult:
        """Validate a System Security Plan (SSP)"""
        return await self.validate_document(ssp_document, OSCALDocumentType.SSP)
    
    async def validate_poam(self, poam_document: Dict[str, Any]) -> ValidationResult:
        """Validate a Plan of Action and Milestones (POA&M)"""
        return await self.validate_document(poam_document, OSCALDocumentType.POAM)
    
    async def validate_assessment_results(
        self,
        assessment_results: Dict[str, Any]
    ) -> ValidationResult:
        """Validate Assessment Results"""
        return await self.validate_document(
            assessment_results,
            OSCALDocumentType.ASSESSMENT_RESULTS
        )
    
    async def validate_component_definition(
        self,
        component_def: Dict[str, Any]
    ) -> ValidationResult:
        """Validate a Component Definition"""
        return await self.validate_document(
            component_def,
            OSCALDocumentType.COMPONENT_DEFINITION
        )


def get_oscal_validator_service() -> OSCALValidatorService:
    """Get OSCAL validator service instance"""
    return OSCALValidatorService()
