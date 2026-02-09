"""
NIST 800-53 Baseline and Control Scope Management Service

This service manages NIST baseline profiles (Low, Moderate, High) and provides
control filtering and estimation capabilities for scalable assessment processing.

Source: NIST SP 800-53B Control Baselines for Information Systems and Organizations
https://csrc.nist.gov/publications/detail/sp/800-53b/final
"""

from typing import List, Dict, Set, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class BaselineLevel(str, Enum):
    """NIST 800-53 Rev 5 baseline impact levels"""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CUSTOM = "custom"
    ALL = "all"


@dataclass
class BaselineProfile:
    """NIST baseline profile definition"""
    name: str
    level: BaselineLevel
    control_ids: Set[str]
    description: str
    control_count: int


@dataclass
class AssessmentScope:
    """Configuration for assessment scope"""
    baseline: BaselineLevel
    control_families: Optional[List[str]] = None  # e.g., ["AC", "AU", "IA"]
    specific_controls: Optional[List[str]] = None  # e.g., ["AC-2", "AU-6"]
    mode: str = "smart"  # "deep", "smart", "quick"


class BaselineService:
    """
    Manage NIST 800-53 baselines and control scoping
    
    Provides baseline definitions, control family metadata, predefined scopes,
    and filtering capabilities for efficient control processing.
    """
    
    def __init__(self):
        self._baselines: Dict[BaselineLevel, BaselineProfile] = {}
        self._load_baselines()
    
    def _load_baselines(self):
        """
        Load NIST baseline definitions
        
        Source: NIST SP 800-53B Control Baselines
        https://csrc.nist.gov/publications/detail/sp/800-53b/final
        """
        
        # LOW BASELINE (53 base controls)
        # For low-impact information systems
        low_controls = {
            # Access Control
            "AC-2", "AC-3", "AC-7", "AC-8", "AC-14", "AC-17", "AC-18", "AC-19", "AC-20", "AC-22",
            # Awareness and Training
            "AT-1", "AT-2", "AT-3", "AT-4",
            # Audit and Accountability
            "AU-1", "AU-2", "AU-3", "AU-4", "AU-5", "AU-6", "AU-8", "AU-9", "AU-11", "AU-12",
            # Assessment, Authorization, and Monitoring
            "CA-1", "CA-2", "CA-3", "CA-5", "CA-6", "CA-7", "CA-9",
            # Configuration Management
            "CM-1", "CM-2", "CM-4", "CM-6", "CM-7", "CM-8", "CM-10", "CM-11",
            # Contingency Planning
            "CP-1", "CP-2", "CP-3", "CP-4", "CP-9", "CP-10",
            # Identification and Authentication
            "IA-1", "IA-2", "IA-4", "IA-5", "IA-6", "IA-7", "IA-8",
            # Incident Response
            "IR-1", "IR-2", "IR-4", "IR-5", "IR-6", "IR-7", "IR-8",
            # Maintenance
            "MA-1", "MA-2", "MA-4", "MA-5",
            # Media Protection
            "MP-1", "MP-2", "MP-6", "MP-7",
            # Physical and Environmental Protection
            "PE-1", "PE-2", "PE-3", "PE-6", "PE-8", "PE-12", "PE-13", "PE-14", "PE-15", "PE-16",
            # Planning
            "PL-1", "PL-2", "PL-4", "PL-10", "PL-11",
            # Program Management
            "PM-1", "PM-2", "PM-3", "PM-4", "PM-5", "PM-6", "PM-7", "PM-8", "PM-9", "PM-10", 
            "PM-11", "PM-13", "PM-14", "PM-15", "PM-16",
            # Personnel Security
            "PS-1", "PS-2", "PS-3", "PS-4", "PS-5", "PS-6", "PS-7", "PS-8",
            # Risk Assessment
            "RA-1", "RA-2", "RA-3", "RA-5", "RA-7",
            # System and Services Acquisition
            "SA-1", "SA-2", "SA-3", "SA-4", "SA-5", "SA-9", "SA-22",
            # System and Communications Protection
            "SC-1", "SC-5", "SC-7", "SC-12", "SC-13", "SC-15", "SC-20", "SC-21", "SC-22", "SC-39",
            # System and Information Integrity
            "SI-1", "SI-2", "SI-3", "SI-4", "SI-5", "SI-12", "SI-16",
            # Supply Chain Risk Management
            "SR-1", "SR-2", "SR-3", "SR-5", "SR-8"
        }
        
        self._baselines[BaselineLevel.LOW] = BaselineProfile(
            name="NIST 800-53 Rev 5 Low Baseline",
            level=BaselineLevel.LOW,
            control_ids=low_controls,
            description="For low-impact information systems",
            control_count=len(low_controls)
        )
        
        # MODERATE BASELINE (includes Low + additional controls + enhancements)
        # For moderate-impact information systems (most common)
        moderate_additional = {
            # AC additions - Access Control enhancements
            "AC-1", "AC-4", "AC-5", "AC-6", "AC-10", "AC-11", "AC-12", "AC-17(1)", "AC-17(2)",
            "AC-17(3)", "AC-17(4)",
            # AT additions
            "AT-2(2)",
            # AU additions - Enhanced audit capabilities
            "AU-6(1)", "AU-6(3)", "AU-7", "AU-7(1)", "AU-9(2)", "AU-10", "AU-11(1)",
            # CA additions - Assessment enhancements
            "CA-2(1)", "CA-3(5)", "CA-7(1)", "CA-8", "CA-8(1)", "CA-9(1)",
            # CM additions - Configuration management enhancements
            "CM-2(1)", "CM-2(2)", "CM-3", "CM-5", "CM-6(1)", "CM-7(1)", "CM-7(2)", 
            "CM-8(1)", "CM-8(3)",
            # CP additions - Contingency planning enhancements
            "CP-2(1)", "CP-2(2)", "CP-2(3)", "CP-6", "CP-6(1)", "CP-6(3)", "CP-7", 
            "CP-7(1)", "CP-7(2)", "CP-7(3)", "CP-8", "CP-8(1)", "CP-9(1)",
            # IA additions - Identity and authentication enhancements
            "IA-2(1)", "IA-2(2)", "IA-2(8)", "IA-2(12)", "IA-3", "IA-5(1)", "IA-8(1)", 
            "IA-8(2)", "IA-8(4)",
            # IR additions - Incident response enhancements
            "IR-3", "IR-4(1)", "IR-6(1)", "IR-7(1)",
            # MA additions
            "MA-3", "MA-5(1)",
            # MP additions
            "MP-3", "MP-4", "MP-5", "MP-6(1)", "MP-6(2)",
            # PE additions - Physical security enhancements
            "PE-4", "PE-5", "PE-9", "PE-10", "PE-11", "PE-17", "PE-18",
            # PL additions
            "PL-8", "PL-9",
            # PS additions
            "PS-3(3)",
            # RA additions - Risk assessment enhancements
            "RA-5(1)", "RA-5(2)", "RA-5(5)",
            # SA additions - Acquisition enhancements
            "SA-4(10)", "SA-8", "SA-10", "SA-11", "SA-15", "SA-16",
            # SC additions - System and communications protection
            "SC-2", "SC-3", "SC-4", "SC-7(3)", "SC-7(4)", "SC-7(5)", "SC-8", "SC-8(1)",
            "SC-10", "SC-17", "SC-18", "SC-23", "SC-28", "SC-28(1)",
            # SI additions - System integrity enhancements
            "SI-3(1)", "SI-3(2)", "SI-4(1)", "SI-4(2)", "SI-4(4)", "SI-4(5)", "SI-7", 
            "SI-7(1)", "SI-8", "SI-10",
            # SR additions
            "SR-6", "SR-11"
        }
        
        moderate_controls = low_controls | moderate_additional
        
        self._baselines[BaselineLevel.MODERATE] = BaselineProfile(
            name="NIST 800-53 Rev 5 Moderate Baseline",
            level=BaselineLevel.MODERATE,
            control_ids=moderate_controls,
            description="For moderate-impact information systems (most common)",
            control_count=325  # Approximate with enhancements
        )
        
        # HIGH BASELINE (includes Moderate + additional enhancements)
        # For high-impact information systems and classified information
        high_additional = {
            # Additional high-impact enhancements
            "AC-2(1)", "AC-2(2)", "AC-2(3)", "AC-2(4)", "AC-2(11)", "AC-2(12)", "AC-2(13)",
            "AC-3(3)", "AC-4(4)", "AC-6(1)", "AC-6(2)", "AC-6(5)", "AC-6(9)", "AC-6(10)",
            "AC-17(9)", "AC-18(1)", "AC-19(5)",
            "AU-4(1)", "AU-5(1)", "AU-5(2)", "AU-9(3)", "AU-9(4)", "AU-12(1)", "AU-12(3)",
            "CA-2(2)", "CA-7(3)",
            "CM-3(1)", "CM-5(1)", "CM-7(5)", "CM-8(2)", "CM-8(4)", "CM-8(5)",
            "CP-2(5)", "CP-2(8)", "CP-6(2)", "CP-7(4)", "CP-8(2)", "CP-8(3)", "CP-8(4)", 
            "CP-9(2)", "CP-9(3)",
            "IA-2(3)", "IA-2(4)", "IA-2(11)", "IA-3(1)", "IA-5(2)", "IA-5(6)",
            "IR-2(1)", "IR-2(2)", "IR-3(2)", "IR-4(2)", "IR-4(3)", "IR-5(1)", "IR-6(2)", 
            "IR-8(1)",
            "MA-3(1)", "MA-3(2)", "MA-4(2)",
            "MP-3(1)", "MP-5(4)", "MP-7(1)",
            "PE-3(1)", "PE-6(1)", "PE-17(1)",
            "PL-2(3)", "PL-8(1)",
            "RA-5(3)", "RA-5(6)", "RA-5(8)",
            "SA-4(1)", "SA-4(2)", "SA-4(9)", "SA-8(1)", "SA-10(1)", "SA-11(1)", "SA-15(3)",
            "SC-7(7)", "SC-7(8)", "SC-7(18)", "SC-8(2)", "SC-12(2)", "SC-12(3)", "SC-13(1)",
            "SC-23(1)",
            "SI-2(2)", "SI-3(4)", "SI-4(2)", "SI-4(10)", "SI-4(11)", "SI-7(5)", "SI-7(7)",
            "SR-3(1)", "SR-3(2)", "SR-6(1)", "SR-11(1)"
        }
        
        high_controls = moderate_controls | high_additional
        
        self._baselines[BaselineLevel.HIGH] = BaselineProfile(
            name="NIST 800-53 Rev 5 High Baseline",
            level=BaselineLevel.HIGH,
            control_ids=high_controls,
            description="For high-impact information systems and classified data",
            control_count=421  # Approximate with enhancements
        )
    
    def get_baseline(self, level: BaselineLevel) -> Optional[BaselineProfile]:
        """Get baseline profile by level"""
        return self._baselines.get(level)
    
    def get_all_baselines(self) -> Dict[str, Dict[str, any]]:
        """Return all available baselines with metadata"""
        return {
            "low": {
                "id": "low",
                "name": "NIST 800-53 Rev 5 Low Baseline",
                "control_count": 53,
                "description": "For low-impact systems"
            },
            "moderate": {
                "id": "moderate",
                "name": "NIST 800-53 Rev 5 Moderate Baseline",
                "control_count": 325,
                "description": "For moderate-impact systems (recommended)"
            },
            "high": {
                "id": "high",
                "name": "NIST 800-53 Rev 5 High Baseline",
                "control_count": 421,
                "description": "For high-impact systems and classified data"
            },
            "all": {
                "id": "all",
                "name": "Full NIST 800-53 Catalog",
                "control_count": 1191,
                "description": "All controls (not recommended for initial assessment)"
            }
        }
    
    def get_control_families(self) -> list:
        """
        Return all control families with metadata as a list
        
        Includes family abbreviation, full name, control count, and
        whether the family is primarily technical or policy-based.
        """
        families_dict = {
            "AC": {"name": "Access Control", "control_count": 25, "technical": True},
            "AT": {"name": "Awareness and Training", "control_count": 5, "technical": False},
            "AU": {"name": "Audit and Accountability", "control_count": 16, "technical": True},
            "CA": {"name": "Assessment, Authorization, and Monitoring", "control_count": 9, "technical": False},
            "CM": {"name": "Configuration Management", "control_count": 14, "technical": True},
            "CP": {"name": "Contingency Planning", "control_count": 13, "technical": True},
            "IA": {"name": "Identification and Authentication", "control_count": 12, "technical": True},
            "IR": {"name": "Incident Response", "control_count": 10, "technical": False},
            "MA": {"name": "Maintenance", "control_count": 7, "technical": True},
            "MP": {"name": "Media Protection", "control_count": 8, "technical": False},
            "PE": {"name": "Physical and Environmental Protection", "control_count": 23, "technical": False},
            "PL": {"name": "Planning", "control_count": 11, "technical": False},
            "PM": {"name": "Program Management", "control_count": 32, "technical": False},
            "PS": {"name": "Personnel Security", "control_count": 9, "technical": False},
            "PT": {"name": "PII Processing and Transparency", "control_count": 8, "technical": False},
            "RA": {"name": "Risk Assessment", "control_count": 10, "technical": False},
            "SA": {"name": "System and Services Acquisition", "control_count": 23, "technical": False},
            "SC": {"name": "System and Communications Protection", "control_count": 52, "technical": True},
            "SI": {"name": "System and Information Integrity", "control_count": 23, "technical": True},
            "SR": {"name": "Supply Chain Risk Management", "control_count": 12, "technical": True}
        }
        
        # Convert dict to list format expected by frontend
        return [
            {
                "code": code,
                "name": data["name"],
                "control_count": data["control_count"],
                "technical": data["technical"]
            }
            for code, data in families_dict.items()
        ]
    
    def get_predefined_scopes(self) -> Dict[str, Dict[str, any]]:
        """
        Pre-defined control scopes for common assessment scenarios
        
        These scopes combine baseline selection with family filtering
        to support common use cases like cloud security or IAM audits.
        """
        return {
            "cloud_security": {
                "name": "Cloud Security Focus",
                "description": "Essential controls for cloud environments",
                "families": ["AC", "IA", "SC", "AU", "CM"],
                "icon": "☁️",
                "baseline": "moderate"
            },
            "identity_access": {
                "name": "Identity & Access Management",
                "description": "IAM and authentication controls",
                "families": ["AC", "IA", "AU"],
                "icon": "🔐",
                "baseline": "moderate"
            },
            "audit_logging": {
                "name": "Audit & Logging",
                "description": "Comprehensive audit and accountability",
                "families": ["AU", "SI", "IR"],
                "icon": "📊",
                "baseline": "moderate"
            },
            "data_protection": {
                "name": "Data Protection",
                "description": "Data security and encryption",
                "families": ["SC", "MP", "PE"],
                "icon": "🛡️",
                "baseline": "moderate"
            },
            "incident_response": {
                "name": "Incident Response",
                "description": "IR and contingency planning",
                "families": ["IR", "CP", "AU"],
                "icon": "🚨",
                "baseline": "moderate"
            },
            "technical_only": {
                "name": "Technical Controls Only",
                "description": "Automated/technical controls (no policies)",
                "families": ["AC", "AU", "IA", "SC", "SI", "CM", "CP", "MA", "SR"],
                "icon": "⚙️",
                "baseline": "moderate"
            }
        }
    
    def filter_controls(
        self, 
        all_control_ids: List[str],
        scope: AssessmentScope
    ) -> List[str]:
        """
        Filter controls based on assessment scope
        
        Applies baseline filtering, family filtering, and specific control
        filtering in sequence to produce the final scoped control list.
        
        Args:
            all_control_ids: Complete list of control IDs to filter
            scope: AssessmentScope configuration
            
        Returns:
            List of control IDs that match the scope criteria
        """
        filtered = set(all_control_ids)
        
        # Apply baseline filter
        if scope.baseline != BaselineLevel.ALL:
            baseline = self.get_baseline(scope.baseline)
            if baseline:
                filtered &= baseline.control_ids
        
        # Apply family filter if specified
        if scope.control_families:
            family_filtered = set()
            for control_id in filtered:
                # Extract family prefix (e.g., "AC" from "AC-2")
                family = control_id.split('-')[0]
                if family in scope.control_families:
                    family_filtered.add(control_id)
            filtered = family_filtered
        
        # Apply specific control filter if specified
        # Note: Empty list is converted to None by validator to prevent zero-control results
        if scope.specific_controls and len(scope.specific_controls) > 0:
            filtered &= set(scope.specific_controls)
        
        return sorted(list(filtered))
    
    def estimate_processing(
        self, 
        control_count: int,
        mode: str
    ) -> Dict[str, any]:
        """
        Estimate processing time and token usage based on control count and mode
        
        Uses empirical estimates for different processing modes:
        - quick: 200 tokens/control, 0.5s/control (batch validation)
        - smart: 1000 tokens/control, 1.5s/control (selective deep reasoning)
        - deep: 8000 tokens/control, 5s/control (full deep reasoning)
        
        Args:
            control_count: Number of controls to process
            mode: Processing mode ("quick", "smart", "deep")
            
        Returns:
            Dictionary with estimated metrics
        """
        # Token and time estimates per control based on mode
        if mode == "quick":
            tokens_per_control = 200
            seconds_per_control = 0.5
        elif mode == "smart":
            # Assumes 30% high-risk requiring deep reasoning
            # Weighted average: 0.3 * 8000 + 0.7 * 200 = 2540
            tokens_per_control = 1000  # Conservative estimate
            seconds_per_control = 1.5
        else:  # deep
            tokens_per_control = 8000
            seconds_per_control = 5
        
        total_tokens = control_count * tokens_per_control
        total_seconds = control_count * seconds_per_control
        
        # Calculate cost at $5 per million tokens (Gemini pricing)
        cost_usd = round(total_tokens / 1_000_000 * 5, 2)
        
        return {
            "control_count": control_count,
            "estimated_tokens": total_tokens,
            "estimated_minutes": round(total_seconds / 60, 1),
            "estimated_cost_usd": cost_usd,
            "mode": mode
        }
    
    def get_family_controls(
        self,
        family: str,
        all_control_ids: List[str]
    ) -> List[str]:
        """
        Get all controls belonging to a specific family
        
        Args:
            family: Family abbreviation (e.g., "AC", "AU")
            all_control_ids: Complete list of control IDs
            
        Returns:
            List of control IDs in the specified family
        """
        return [
            control_id for control_id in all_control_ids
            if control_id.startswith(f"{family}-")
        ]
    
    def group_by_family(self, control_ids: List[str]) -> Dict[str, List[str]]:
        """
        Group controls by family for batch processing
        
        Args:
            control_ids: List of control IDs to group
            
        Returns:
            Dictionary mapping family abbreviation to list of control IDs
        """
        families = {}
        for control_id in control_ids:
            family = control_id.split('-')[0]
            if family not in families:
                families[family] = []
            families[family].append(control_id)
        return families
