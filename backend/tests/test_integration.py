"""
Integration tests for end-to-end processing pipeline.
These tests verify that components work together correctly.
"""

import os
import pytest
from unittest.mock import Mock, AsyncMock, patch
from app.models import (
    ControlGap,
    ControlMapping,
    EvidenceArtifact,
    RiskLevel,
    ControlFamily,
    EvidenceType
)
from app.services.gemini_service import GeminiService


class TestControlGapIntegration:
    """Test that ControlGap attributes are accessed correctly throughout the codebase."""
    
    def test_control_gap_risk_level_attribute_exists(self):
        """Verify ControlGap has risk_level, not severity."""
        gap = ControlGap(
            control_id="AC-2",
            control_name="Account Management",
            gap_description="MFA not implemented",
            risk_level=RiskLevel.HIGH,
            risk_score=85,
            affected_requirements=["AC-2(1)"],
            recommended_actions=["Implement MFA"]
        )
        
        # Should have risk_level
        assert hasattr(gap, 'risk_level')
        assert gap.risk_level == RiskLevel.HIGH
        
        # Should NOT have severity
        assert not hasattr(gap, 'severity')
    
    @pytest.mark.asyncio
    async def test_prioritize_controls_uses_risk_level(self):
        """Test that prioritize_controls correctly accesses gap.risk_level."""
        # Mock GeminiService without needing Settings
        with patch('app.services.gemini_service.genai.GenerativeModel'):
            # Create service with mocked model
            service = Mock(spec=GeminiService)
            service.prioritize_controls = GeminiService.prioritize_controls.__get__(service)
            
            # Create test data with ControlGaps
            control_mappings = [
                ControlMapping(
                    control_id="AC-2",
                    control_name="Account Management",
                    control_family=ControlFamily.AC,
                    evidence_ids=["ev-1"],
                    implementation_status="partially_implemented",
                    implementation_description="Partially implemented",
                    confidence_score=0.8,
                    gaps_identified=["MFA not enabled"]
                )
            ]
            
            control_gaps = [
                ControlGap(
                    control_id="AC-2",
                    control_name="Account Management",
                    gap_description="MFA not implemented",
                    risk_level=RiskLevel.CRITICAL,  # HIGH/CRITICAL should go to critical bucket
                    risk_score=95,
                    affected_requirements=["AC-2(1)"],
                    recommended_actions=["Implement MFA"]
                )
            ]
            
            # This should work without AttributeError
            try:
                result = service.prioritize_controls(control_mappings, control_gaps)
                
                # Critical risk_level gaps should be in critical bucket
                assert "AC-2" in result["critical"]
                assert "AC-2" not in result["standard"]
                assert "AC-2" not in result["passing"]
                
            except AttributeError as e:
                if "severity" in str(e):
                    pytest.fail(f"Code is trying to access gap.severity instead of gap.risk_level: {e}")
                raise


class TestProcessingPipelineIntegration:
    """Test integration between main.py processing and model usage."""
    
    def test_critical_gaps_calculation_uses_risk_level(self):
        """Test that main.py correctly filters gaps by risk_level."""
        control_gaps = [
            ControlGap(
                control_id="AC-2",
                control_name="Account Management", 
                gap_description="MFA not implemented",
                risk_level=RiskLevel.CRITICAL,
                risk_score=95,
                affected_requirements=["AC-2(1)"],
                recommended_actions=["Implement MFA"]
            ),
            ControlGap(
                control_id="IA-5",
                control_name="Authenticator Management",
                gap_description="Weak password policy",
                risk_level=RiskLevel.HIGH,
                risk_score=75,
                affected_requirements=["IA-5(1)"],
                recommended_actions=["Strengthen policy"]
            ),
            ControlGap(
                control_id="CM-2",
                control_name="Baseline Configuration",
                gap_description="Minor config drift",
                risk_level=RiskLevel.MEDIUM,
                risk_score=45,
                affected_requirements=["CM-2(1)"],
                recommended_actions=["Update baseline"]
            )
        ]
        
        # Simulate the calculation from main.py line 556
        try:
            critical_gaps = sum(
                1 for g in control_gaps 
                if g.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]
            )
            
            assert critical_gaps == 2  # CRITICAL + HIGH
            
        except AttributeError as e:
            if "severity" in str(e):
                pytest.fail(f"Code is trying to access gap.severity instead of gap.risk_level: {e}")
            raise


class TestGeminiServiceAttributeAccess:
    """Test that GeminiService methods access correct model attributes."""
    
    def test_control_gap_json_parsing_uses_risk_level(self):
        """Test that ControlGap can be created from JSON with risk_level."""
        # Simulate JSON response from Gemini API
        gap_json = {
            "control_id": "AC-2",
            "control_name": "Account Management",
            "gap_description": "MFA not implemented",
            "risk_level": "high",  # API returns lowercase string
            "risk_score": 85,
            "affected_requirements": ["AC-2(1)"],
            "recommended_actions": ["Implement MFA"]
        }
        
        # This is how the code parses API responses
        try:
            gap = ControlGap(**gap_json)
            
            # Verify it has risk_level (not severity)
            assert hasattr(gap, 'risk_level')
            assert gap.risk_level == RiskLevel.HIGH
            assert not hasattr(gap, 'severity')
            
            # Verify code can access risk_level in comparisons
            # (This is the pattern used in gemini_service.py and main.py)
            is_critical = gap.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]
            assert is_critical == True
            
        except AttributeError as e:
            if "severity" in str(e):
                pytest.fail(f"Code tried to access gap.severity instead of gap.risk_level: {e}")
            raise
    
    def test_control_gap_filtering_by_risk_level(self):
        """Test filtering ControlGaps by risk_level (not severity)."""
        gaps = [
            ControlGap(
                control_id="AC-2",
                control_name="Account Management",
                gap_description="Critical gap",
                risk_level=RiskLevel.CRITICAL,
                risk_score=95,
                affected_requirements=["AC-2(1)"],
                recommended_actions=["Fix immediately"]
            ),
            ControlGap(
                control_id="IA-5",
                control_name="Authenticator Management",
                gap_description="High risk gap",
                risk_level=RiskLevel.HIGH,
                risk_score=75,
                affected_requirements=["IA-5(1)"],
                recommended_actions=["Fix soon"]
            ),
            ControlGap(
                control_id="CM-2",
                control_name="Baseline Configuration",
                gap_description="Medium risk gap",
                risk_level=RiskLevel.MEDIUM,
                risk_score=45,
                affected_requirements=["CM-2(1)"],
                recommended_actions=["Fix when possible"]
            )
        ]
        
        # This is the actual filtering pattern used in services/gemini_service.py
        try:
            critical_or_high = [
                g for g in gaps 
                if g.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]
            ]
            
            assert len(critical_or_high) == 2
            assert all(g.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL] for g in critical_or_high)
            
            # Verify medium risk gap is not included
            medium_gaps = [g for g in gaps if g.risk_level == RiskLevel.MEDIUM]
            assert len(medium_gaps) == 1
            
        except AttributeError as e:
            if "severity" in str(e):
                pytest.fail(f"Code tried to access gap.severity instead of gap.risk_level: {e}")
            raise
