"""
Test suite for D.A.V.E service layer modules.
Tests baseline_service, nist_catalog_service, and oscal_validator.
"""

import pytest
from app.services.baseline_service import BaselineService, BaselineLevel, BaselineProfile
from app.services.nist_catalog_service import NISTCatalogService, NISTControl, ControlFamily
from app.services.oscal_validator import OSCALValidatorService, OSCALDocumentType, ValidationResult


class TestBaselineService:
    """Tests for NIST baseline management service."""
    
    @pytest.fixture
    def baseline_service(self):
        """Fixture to create BaselineService instance."""
        return BaselineService()
    
    def test_get_low_baseline(self, baseline_service):
        """Test retrieving NIST 800-53 Low baseline profile."""
        profile = baseline_service.get_baseline(BaselineLevel.LOW)
        
        assert isinstance(profile, BaselineProfile)
        assert profile.level == BaselineLevel.LOW
        assert profile.control_count > 0
        assert "AC-2" in profile.control_ids
        assert "AC-3" in profile.control_ids
    
    def test_get_moderate_baseline(self, baseline_service):
        """Test retrieving NIST 800-53 Moderate baseline profile."""
        profile = baseline_service.get_baseline(BaselineLevel.MODERATE)
        
        assert isinstance(profile, BaselineProfile)
        assert profile.level == BaselineLevel.MODERATE
        assert profile.control_count > 100  # Moderate has more controls than Low
    
    def test_get_high_baseline(self, baseline_service):
        """Test retrieving NIST 800-53 High baseline profile."""
        profile = baseline_service.get_baseline(BaselineLevel.HIGH)
        
        assert isinstance(profile, BaselineProfile)
        assert profile.level == BaselineLevel.HIGH
        assert profile.control_count > 200  # High has most controls
    
    def test_baseline_hierarchy(self, baseline_service):
        """Test that Low ⊂ Moderate ⊂ High (baseline hierarchy)."""
        low = baseline_service.get_baseline(BaselineLevel.LOW)
        moderate = baseline_service.get_baseline(BaselineLevel.MODERATE)
        high = baseline_service.get_baseline(BaselineLevel.HIGH)
        
        # Low controls should be subset of Moderate
        assert low.control_ids.issubset(moderate.control_ids)
        # Moderate controls should be subset of High
        assert moderate.control_ids.issubset(high.control_ids)
    
    def test_get_all_baselines(self, baseline_service):
        """Test retrieving all baseline information."""
        baselines = baseline_service.get_all_baselines()
        
        assert isinstance(baselines, dict)
        assert "low" in baselines
        assert "moderate" in baselines
        assert "high" in baselines
    
    def test_get_control_families(self, baseline_service):
        """Test retrieving control family metadata."""
        families = baseline_service.get_control_families()
        
        assert isinstance(families, list)
        assert len(families) == 20  # NIST 800-53 Rev 5 has 20 control families
        
        # Check AC family exists
        ac_family = next((f for f in families if f["code"] == "AC"), None)
        assert ac_family is not None
        assert ac_family["name"] == "Access Control"
    
    def test_group_by_family(self, baseline_service):
        """Test grouping control IDs by family."""
        controls = ["AC-2", "AC-3", "IA-5", "AU-12"]
        grouped = baseline_service.group_by_family(controls)
        
        assert isinstance(grouped, dict)
        assert "AC" in grouped
        assert "IA" in grouped
        assert "AU" in grouped
        assert len(grouped["AC"]) == 2
        assert len(grouped["IA"]) == 1


class TestNISTCatalogService:
    """Tests for NIST 800-53 catalog service."""
    
    @pytest.fixture
    def catalog_service(self):
        """Fixture to create NISTCatalogService instance."""
        service = NISTCatalogService()
        service.load_catalog()  # Load catalog into memory
        return service
    
    def test_load_catalog(self, catalog_service):
        """Test loading NIST 800-53 Rev 5 catalog."""
        assert catalog_service._catalog_data is not None
        assert catalog_service._controls is not None
        assert len(catalog_service._controls) > 300  # Should have 324+ controls
    
    def test_get_control_by_id(self, catalog_service):
        """Test retrieving specific control by ID."""
        control = catalog_service.get_control("AC-1")
        
        assert isinstance(control, NISTControl)
        assert control.id == "AC-1"
        assert control.title == "Policy and Procedures"
        assert control.family == "AC"
        assert len(control.statement) > 0
    
    def test_get_nonexistent_control(self, catalog_service):
        """Test retrieving non-existent control returns None."""
        control = catalog_service.get_control("XX-999")
        assert control is None
    
    def test_get_controls_by_family(self, catalog_service):
        """Test retrieving controls by family."""
        ac_controls = catalog_service.get_controls_by_family("AC")
        
        assert isinstance(ac_controls, list)
        assert len(ac_controls) > 20  # AC family has 25+ controls
        # Check all controls are from AC family
        for ctrl in ac_controls:
            assert ctrl["family_code"] == "AC"
    
    def test_get_all_families(self, catalog_service):
        """Test retrieving all control families."""
        families = catalog_service.get_all_families()
        
        assert isinstance(families, list)
        assert len(families) == 20
        assert all(isinstance(f, ControlFamily) for f in families)
    
    def test_search_controls_by_keyword(self, catalog_service):
        """Test searching controls by keyword."""
        results = catalog_service.search_controls("encryption")
        
        assert isinstance(results, list)
        assert len(results) > 0
        assert all(isinstance(r, NISTControl) for r in results)
        # Check that SC (System and Communications Protection) controls are in results
        assert any("SC-" in r.id for r in results)
    
    def test_get_control_requirements(self, catalog_service):
        """Test retrieving control requirements."""
        requirements = catalog_service.get_control_requirements("AC-2")
        
        assert isinstance(requirements, dict)
        assert "control_id" in requirements
        assert requirements["control_id"] == "AC-2"
    
    def test_get_all_control_ids(self, catalog_service):
        """Test retrieving all control IDs."""
        control_ids = catalog_service.get_all_control_ids()
        
        assert isinstance(control_ids, list)
        assert len(control_ids) > 300
        assert "AC-1" in control_ids
        assert "AC-2" in control_ids


class TestOSCALValidator:
    """Tests for OSCAL schema validation."""
    
    @pytest.fixture
    def validator(self):
        """Fixture to create OSCALValidatorService instance."""
        return OSCALValidatorService()
    
    @pytest.mark.asyncio
    async def test_validate_ssp_component_valid(self, validator):
        """Test validation of valid SSP component."""
        valid_ssp = {
            "system-security-plan": {
                "uuid": "12345678-1234-1234-1234-123456789012",
                "metadata": {
                    "title": "Test SSP Component",
                    "last-modified": "2026-02-05T00:00:00Z",
                    "version": "1.0",
                    "oscal-version": "1.2.0"
                },
                "control-implementation": {
                    "description": "Test implementation",
                    "implemented-requirements": [
                        {
                            "uuid": "87654321-4321-4321-4321-210987654321",
                            "control-id": "AC-1",
                            "description": "Policy implemented via corporate handbook"
                        }
                    ]
                }
            }
        }
        
        result = await validator.validate_ssp(valid_ssp)
        
        assert isinstance(result, ValidationResult)
        assert result.document_type == OSCALDocumentType.SSP
        assert result.oscal_version == "1.2.0"
    
    @pytest.mark.asyncio
    async def test_validate_ssp_component_missing_uuid(self, validator):
        """Test validation catches missing UUID."""
        invalid_ssp = {
            "system-security-plan": {
                "metadata": {
                    "title": "Test SSP"
                }
            }
        }
        
        result = await validator.validate_ssp(invalid_ssp)
        
        assert isinstance(result, ValidationResult)
        assert result.error_count > 0  # Should have validation errors
    
    @pytest.mark.asyncio
    async def test_validate_poam_entry_valid(self, validator):
        """Test validation of valid POA&M entry."""
        valid_poam = {
            "plan-of-action-and-milestones": {
                "uuid": "12345678-1234-1234-1234-123456789012",
                "metadata": {
                    "title": "Remediation Plan",
                    "last-modified": "2026-02-05T00:00:00Z",
                    "version": "1.0",
                    "oscal-version": "1.2.0"
                },
                "poam-items": [
                    {
                        "uuid": "87654321-4321-4321-4321-210987654321",
                        "title": "Implement MFA",
                        "description": "Multi-factor authentication not implemented"
                    }
                ]
            }
        }
        
        result = await validator.validate_poam(valid_poam)
        
        assert isinstance(result, ValidationResult)
        assert result.document_type == OSCALDocumentType.POAM
    
    @pytest.mark.asyncio
    async def test_validate_document_generic(self, validator):
        """Test generic document validation."""
        doc = {
            "system-security-plan": {
                "uuid": "12345678-1234-1234-1234-123456789012",
                "metadata": {
                    "title": "Test",
                    "last-modified": "2026-02-05T00:00:00Z",
                    "version": "1.0",
                    "oscal-version": "1.2.0"
                }
            }
        }
        
        result = await validator.validate_document(doc, OSCALDocumentType.SSP)
        
        assert isinstance(result, ValidationResult)
        assert result.document_type == OSCALDocumentType.SSP


class TestServiceIntegration:
    """Integration tests across services."""
    
    @pytest.fixture
    def baseline_service(self):
        return BaselineService()
    
    @pytest.fixture
    def catalog_service(self):
        service = NISTCatalogService()
        service.load_catalog()
        return service
    
    def test_baseline_controls_exist_in_catalog(self, baseline_service, catalog_service):
        """Test that all baseline controls exist in catalog."""
        low_profile = baseline_service.get_baseline(BaselineLevel.LOW)
        
        # Sample a few controls (checking all 139 would be slow)
        sample_controls = list(low_profile.control_ids)[:10]
        
        for control_id in sample_controls:
            control = catalog_service.get_control(control_id)
            assert control is not None, f"Control {control_id} not found in catalog"
    
    def test_moderate_includes_low_controls(self, baseline_service, catalog_service):
        """Test Moderate baseline includes all Low baseline controls."""
        low = baseline_service.get_baseline(BaselineLevel.LOW)
        moderate = baseline_service.get_baseline(BaselineLevel.MODERATE)
        
        # Verify Low is subset of Moderate
        assert low.control_ids.issubset(moderate.control_ids)
        
        # Verify some Low controls exist in catalog
        sample = ["AC-2", "IA-5", "AU-12"]
        for control_id in sample:
            control = catalog_service.get_control(control_id)
            assert control is not None
    
    def test_control_families_coverage(self, baseline_service, catalog_service):
        """Test that baselines cover multiple control families."""
        high_profile = baseline_service.get_baseline(BaselineLevel.HIGH)
        families = catalog_service.get_all_families()
        
        # Group high baseline controls by family
        grouped = baseline_service.group_by_family(list(high_profile.control_ids))
        
        # High baseline should cover most families
        assert len(grouped) >= 15  # At least 15 of 20 families
        
        # Verify AC family has many controls
        assert "AC" in grouped
        assert len(grouped["AC"]) >= 10
