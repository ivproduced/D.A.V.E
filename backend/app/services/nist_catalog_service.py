"""
NIST 800-53 Rev 5 Catalog Service

This service loads and parses the NIST 800-53 Rev 5 control catalog,
providing search, lookup, and validation capabilities for compliance analysis.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from functools import lru_cache
from pydantic import BaseModel


class AssessmentMethod(BaseModel):
    """Assessment method for a control"""
    name: str  # EXAMINE, INTERVIEW, TEST
    objects: List[str] = []  # What to examine/interview/test


class AssessmentObjective(BaseModel):
    """Assessment objective for control validation"""
    id: str  # e.g., AC-02a.01
    description: str  # What to determine/verify
    methods: List[AssessmentMethod] = []
    parts: List['AssessmentObjective'] = []


class ControlEnhancement(BaseModel):
    """Control enhancement (e.g., AC-2(1))"""
    id: str
    title: str
    statement: str
    guidance: Optional[str] = None
    related_controls: List[str] = []


class NISTControl(BaseModel):
    """NIST 800-53 Rev 5 Control"""
    id: str  # e.g., AC-2
    title: str
    class_type: str  # Control class (e.g., Technical, Operational)
    family: str  # Control family (e.g., AC, IA, SC)
    
    # Core control information
    statement: str
    guidance: Optional[str] = None  # Implementation guidance from NIST
    related_controls: List[str] = []
    
    # Assessment information
    assessment_objectives: List[AssessmentObjective] = []
    
    # Enhancements
    enhancements: List[ControlEnhancement] = []
    
    # Parameters (if any)
    parameters: Dict[str, Any] = {}
    
    # Properties
    properties: Dict[str, str] = {}


class ControlFamily(BaseModel):
    """Control family grouping"""
    id: str  # e.g., AC
    title: str
    controls: List[str] = []  # List of control IDs


class NISTCatalogService:
    """Service for loading and querying NIST 800-53 Rev 5 catalog"""
    
    def __init__(self, catalog_path: Optional[str] = None):
        """Initialize the catalog service"""
        if catalog_path is None:
            # Default to the downloaded catalog
            catalog_path = Path(__file__).parent.parent.parent / "data" / "NIST_SP-800-53_rev5_catalog.json"
        
        self.catalog_path = Path(catalog_path)
        self._catalog_data: Optional[Dict] = None
        self._controls: Dict[str, NISTControl] = {}
        self._families: Dict[str, ControlFamily] = {}
        self._requirements_cache: Dict[str, Dict[str, Any]] = {}  # Cache for control requirements
        self._loaded = False
    
    def load_catalog(self) -> None:
        """Load and parse the NIST catalog"""
        if self._loaded:
            return
        
        if not self.catalog_path.exists():
            raise FileNotFoundError(f"NIST catalog not found at {self.catalog_path}")
        
        print(f"Loading NIST 800-53 Rev 5 catalog from {self.catalog_path}")
        
        with open(self.catalog_path, 'r', encoding='utf-8') as f:
            self._catalog_data = json.load(f)
        
        # Parse the catalog structure
        catalog = self._catalog_data.get('catalog', {})
        groups = catalog.get('groups', [])
        
        # Process control families and controls
        for group in groups:
            family_id = group.get('id', '').upper()
            family_title = group.get('title', '')
            
            family = ControlFamily(
                id=family_id,
                title=family_title,
                controls=[]
            )
            
            # Process controls in this family
            controls = group.get('controls', [])
            for control_data in controls:
                control = self._parse_control(control_data, family_id)
                if control:
                    self._controls[control.id] = control
                    family.controls.append(control.id)
            
            self._families[family_id] = family
        
        self._loaded = True
        print(f"Loaded {len(self._controls)} controls from {len(self._families)} families")
    
    def _parse_control(self, control_data: Dict, family_id: str) -> Optional[NISTControl]:
        """Parse a single control from the OSCAL JSON structure"""
        try:
            control_id = control_data.get('id', '').upper()
            title = control_data.get('title', '')
            
            # Extract control statement
            statement = self._extract_statement(control_data)
            
            # Extract properties
            properties = {}
            for prop in control_data.get('props', []):
                properties[prop.get('name', '')] = prop.get('value', '')
            
            # Extract control class
            class_type = properties.get('label', 'Unknown')
            
            # Extract guidance
            guidance = None
            parts = control_data.get('parts', [])
            for part in parts:
                part_name = part.get('name', '')
                if part_name == 'guidance':
                    guidance = part.get('prose', '')
                    break
            
            # Extract related controls
            related_controls = []
            links = control_data.get('links', [])
            for link in links:
                if link.get('rel') == 'related':
                    related_controls.append(link.get('href', '').replace('#', ''))
            
            # Extract enhancements
            enhancements = []
            for enhancement_data in control_data.get('controls', []):
                enhancement = self._parse_enhancement(enhancement_data)
                if enhancement:
                    enhancements.append(enhancement)
            
            # Create control object
            control = NISTControl(
                id=control_id,
                title=title,
                class_type=class_type,
                family=family_id,
                statement=statement,
                guidance=guidance,
                related_controls=related_controls,
                enhancements=enhancements,
                properties=properties
            )
            
            return control
            
        except Exception as e:
            print(f"Error parsing control: {e}")
            return None
    
    def _parse_enhancement(self, enhancement_data: Dict) -> Optional[ControlEnhancement]:
        """Parse a control enhancement"""
        try:
            enhancement_id = enhancement_data.get('id', '').upper()
            title = enhancement_data.get('title', '')
            statement = self._extract_statement(enhancement_data)
            
            # Extract guidance
            guidance = None
            parts = enhancement_data.get('parts', [])
            for part in parts:
                if part.get('name') == 'guidance':
                    guidance = part.get('prose', '')
                    break
            
            # Extract related controls
            related_controls = []
            links = enhancement_data.get('links', [])
            for link in links:
                if link.get('rel') == 'related':
                    related_controls.append(link.get('href', '').replace('#', ''))
            
            return ControlEnhancement(
                id=enhancement_id,
                title=title,
                statement=statement,
                guidance=guidance,
                related_controls=related_controls
            )
        except Exception as e:
            print(f"Error parsing enhancement: {e}")
            return None
    
    def _extract_statement(self, control_data: Dict) -> str:
        """Extract control statement from OSCAL structure"""
        parts = control_data.get('parts', [])
        statements = []
        
        for part in parts:
            if part.get('name') == 'statement':
                prose = part.get('prose', '')
                if prose:
                    statements.append(prose)
                
                # Check for nested statement parts
                sub_parts = part.get('parts', [])
                for sub_part in sub_parts:
                    sub_prose = sub_part.get('prose', '')
                    if sub_prose:
                        statements.append(sub_prose)
        
        return ' '.join(statements)
    
    def get_all_controls(self) -> List[NISTControl]:
        """Get all controls from the catalog"""
        self.load_catalog()
        return list(self._controls.values())
    
    def get_controls_by_family(self, family_code: str) -> List[Dict[str, str]]:
        """
        Get all controls for a specific family
        
        Args:
            family_code: Family code (e.g., 'AC', 'AU')
        
        Returns:
            List of dicts with id, title, and family_code
        """
        self.load_catalog()
        
        controls = []
        for control in self._controls.values():
            if control.family == family_code:
                controls.append({
                    "id": control.id,
                    "title": control.title,
                    "family_code": control.family
                })
        
        return sorted(controls, key=lambda x: x["id"])
    
    def get_control(self, control_id: str) -> Optional[NISTControl]:
        """Get a control by ID"""
        if not self._loaded:
            self.load_catalog()
        return self._controls.get(control_id.upper())
    
    def get_family(self, family_id: str) -> Optional[ControlFamily]:
        """Get a control family by ID"""
        if not self._loaded:
            self.load_catalog()
        return self._families.get(family_id.upper())
    
    def get_all_families(self) -> List[ControlFamily]:
        """Get all control families"""
        if not self._loaded:
            self.load_catalog()
        return list(self._families.values())
    
    def search_controls(self, query: str, family: Optional[str] = None) -> List[NISTControl]:
        """Search controls by keyword"""
        if not self._loaded:
            self.load_catalog()
        
        query_lower = query.lower()
        results = []
        
        for control in self._controls.values():
            # Filter by family if specified
            if family and control.family != family.upper():
                continue
            
            # Search in title, statement, guidance
            if (query_lower in control.title.lower() or
                query_lower in control.statement.lower() or
                (control.guidance and query_lower in control.guidance.lower())):
                results.append(control)
        
        return results
    
    def get_control_requirements(self, control_id: str) -> Dict[str, Any]:
        """
        Get comprehensive requirements for a control including:
        - Control statement
        - Assessment objectives
        - Recommended assessment methods
        - Related controls
        
        Results are cached in memory for performance.
        """
        cache_key = control_id.upper()
        
        # Check cache first
        if cache_key in self._requirements_cache:
            return self._requirements_cache[cache_key]
        
        control = self.get_control(control_id)
        if not control:
            return {}
        
        requirements = {
            'control_id': control.id,
            'title': control.title,
            'statement': control.statement,
            'guidance': control.guidance,
            'related_controls': control.related_controls,
            'enhancements': [
                {
                    'id': e.id,
                    'title': e.title,
                    'statement': e.statement
                }
                for e in control.enhancements
            ],
            'assessment_methods': ['EXAMINE', 'INTERVIEW', 'TEST'],  # Default methods
            'class': control.class_type,
            'family': control.family
        }
        
        # Cache the result
        self._requirements_cache[cache_key] = requirements
        return requirements
    
    def get_control_requirements_batch(self, control_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Efficiently load multiple control requirements at once
        
        Args:
            control_ids: List of control IDs to load
            
        Returns:
            Dictionary mapping control ID to requirements
        """
        return {
            control_id: self.get_control_requirements(control_id)
            for control_id in control_ids
        }
    
    def get_all_control_ids(self) -> List[str]:
        """
        Get list of all control IDs in the catalog
        
        Returns:
            Sorted list of all control IDs
        """
        if not self._loaded:
            self.load_catalog()
        return sorted(list(self._controls.keys()))
    
    def validate_evidence_against_control(
        self, 
        control_id: str, 
        evidence_summary: str
    ) -> Dict[str, Any]:
        """
        Validate if evidence meets control requirements
        Returns validation result with gaps and recommendations
        """
        control = self.get_control(control_id)
        if not control:
            return {
                'valid': False,
                'error': f'Control {control_id} not found'
            }
        
        # Basic validation (to be enhanced with AI analysis)
        # Check if evidence mentions key terms from control statement
        statement_keywords = set(control.statement.lower().split())
        evidence_keywords = set(evidence_summary.lower().split())
        
        overlap = statement_keywords & evidence_keywords
        coverage_score = len(overlap) / len(statement_keywords) if statement_keywords else 0
        
        return {
            'valid': coverage_score > 0.3,  # 30% keyword overlap threshold
            'control_id': control_id,
            'coverage_score': coverage_score,
            'gaps': [] if coverage_score > 0.5 else ['Insufficient evidence detail'],
            'recommendations': self._generate_recommendations(control)
        }
    
    def _generate_recommendations(self, control: NISTControl) -> List[str]:
        """Generate basic recommendations for control implementation"""
        recommendations = []
        
        if control.guidance:
            recommendations.append(f"Review guidance: {control.guidance[:200]}...")
        
        if control.related_controls:
            recommendations.append(
                f"Review related controls: {', '.join(control.related_controls[:5])}"
            )
        
        return recommendations


@lru_cache()
def get_nist_catalog_service() -> NISTCatalogService:
    """Get cached NIST catalog service instance"""
    service = NISTCatalogService()
    service.load_catalog()
    return service
