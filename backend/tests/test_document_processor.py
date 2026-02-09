"""
Test suite for document processing utilities.
Tests PDF, DOCX, image, and config file processing.
"""

import pytest
import io
from PIL import Image
from app.utils.document_processor import DocumentProcessor
from app.models import EvidenceType


class TestDocumentProcessor:
    """Tests for DocumentProcessor class."""
    
    @pytest.fixture
    def sample_pdf_bytes(self):
        """Create a minimal valid PDF for testing."""
        # Minimal PDF structure
        return b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF"""
    
    def test_detect_file_type_pdf(self):
        """Test PDF file type detection."""
        file_type = DocumentProcessor.detect_file_type("document.pdf", "application/pdf")
        assert file_type == EvidenceType.PDF_DOCUMENT
    
    def test_detect_file_type_docx(self):
        """Test DOCX file type detection."""
        file_type = DocumentProcessor.detect_file_type("document.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        assert file_type == EvidenceType.WORD_DOCUMENT
    
    def test_detect_file_type_image_png(self):
        """Test PNG image type detection."""
        file_type = DocumentProcessor.detect_file_type("screenshot.png", "image/png")
        assert file_type == EvidenceType.SCREENSHOT
    
    def test_detect_file_type_image_jpg(self):
        """Test JPEG image type detection."""
        file_type = DocumentProcessor.detect_file_type("photo.jpg", "image/jpeg")
        assert file_type == EvidenceType.SCREENSHOT
    
    def test_detect_file_type_yaml(self):
        """Test YAML config file detection."""
        file_type = DocumentProcessor.detect_file_type("config.yaml", "application/x-yaml")
        assert file_type == EvidenceType.CONFIG_FILE
    
    def test_detect_file_type_json(self):
        """Test JSON config file detection."""
        file_type = DocumentProcessor.detect_file_type("config.json", "application/json")
        assert file_type == EvidenceType.CONFIG_FILE
    
    def test_process_pdf_basic(self, sample_pdf_bytes):
        """Test basic PDF processing."""
        result = DocumentProcessor.process_pdf(sample_pdf_bytes, "test.pdf")
        
        assert isinstance(result, dict)
        assert "text" in result
        assert "metadata" in result
        assert "type" in result
        assert result["type"] == EvidenceType.PDF_DOCUMENT
        assert isinstance(result["metadata"], dict)
    
    def test_process_image_png(self):
        """Test PNG image processing."""
        # Create a small test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        result = DocumentProcessor.process_image(img_bytes.getvalue(), "test.png")
        
        assert isinstance(result, dict)
        assert "metadata" in result
        assert "type" in result
        assert result["type"] == EvidenceType.SCREENSHOT
    
    def test_process_image_jpeg(self):
        """Test JPEG image processing."""
        # Create a small test image
        img = Image.new('RGB', (100, 100), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        result = DocumentProcessor.process_image(img_bytes.getvalue(), "test.jpg")
        
        assert isinstance(result, dict)
        assert "metadata" in result
        assert result["metadata"]["width"] == 100
        assert result["metadata"]["height"] == 100
    
    def test_process_config_yaml(self):
        """Test YAML configuration file processing."""
        yaml_content = b"""
version: 1.0
security:
  encryption: AES256
  mfa: enabled
controls:
  - AC-2
  - IA-5
"""
        result = DocumentProcessor.process_config_file(yaml_content, "config.yaml")
        
        assert isinstance(result, dict)
        assert "parsed_data" in result
        assert "type" in result
        assert result["type"] == EvidenceType.CONFIG_FILE
        assert isinstance(result["parsed_data"], dict)
        assert "version" in result["parsed_data"]
    
    def test_process_config_json(self):
        """Test JSON configuration file processing."""
        json_content = b'{"version": "1.0", "security": {"mfa": true}, "controls": ["AC-2"]}'
        
        result = DocumentProcessor.process_config_file(json_content, "config.json")
        
        assert isinstance(result, dict)
        assert "parsed_data" in result
        assert isinstance(result["parsed_data"], dict)
        assert result["parsed_data"]["version"] == "1.0"
    
    def test_process_file_pdf(self, sample_pdf_bytes):
        """Test unified file processing for PDF."""
        result = DocumentProcessor.process_file(
            sample_pdf_bytes,
            "document.pdf",
            "application/pdf"
        )
        
        assert isinstance(result, dict)
        assert result["type"] == EvidenceType.PDF_DOCUMENT
    
    def test_process_file_image(self):
        """Test unified file processing for images."""
        img = Image.new('RGB', (50, 50), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        
        result = DocumentProcessor.process_file(
            img_bytes.getvalue(),
            "screenshot.png",
            "image/png"
        )
        
        assert isinstance(result, dict)
        assert result["type"] == EvidenceType.SCREENSHOT


class TestPDFProcessing:
    """Specific tests for PDF processing features."""
    
    def test_pdf_metadata_extraction(self):
        """Test PDF metadata extraction."""
        pdf_content = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 2/Kids[3 0 R 4 0 R]>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
4 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000109 00000 n
0000000183 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
257
%%EOF"""
        
        result = DocumentProcessor.process_pdf(pdf_content, "test.pdf")
        
        assert "metadata" in result
        assert "num_pages" in result["metadata"]


class TestImageProcessing:
    """Specific tests for image processing features."""
    
    def test_image_metadata_extraction(self):
        """Test extracting image dimensions."""
        img = Image.new('RGB', (200, 150), color='yellow')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        
        result = DocumentProcessor.process_image(img_bytes.getvalue(), "test.png")
        
        assert result["metadata"]["width"] == 200
        assert result["metadata"]["height"] == 150
        assert result["metadata"]["format"] == "PNG"
    
    def test_different_image_formats(self):
        """Test processing different image formats."""
        formats = [('PNG', 'test.png'), ('JPEG', 'test.jpg')]
        
        for fmt, filename in formats:
            img = Image.new('RGB', (100, 100), color='blue')
            img_bytes = io.BytesIO()
            img.save(img_bytes, format=fmt)
            
            result = DocumentProcessor.process_image(img_bytes.getvalue(), filename)
            
            assert result["type"] == EvidenceType.SCREENSHOT
            assert result["metadata"]["format"] in [fmt, 'PNG', 'JPEG']


class TestConfigFileProcessing:
    """Specific tests for configuration file processing."""
    
    def test_yaml_parsing(self):
        """Test YAML configuration parsing."""
        yaml_data = b"""
database:
  host: localhost
  port: 5432
logging:
  level: INFO
"""
        result = DocumentProcessor.process_config_file(yaml_data, "config.yaml")
        
        assert "database" in result["parsed_data"]
        assert result["parsed_data"]["database"]["host"] == "localhost"
    
    def test_json_parsing(self):
        """Test JSON configuration parsing."""
        json_data = b'{"api": {"version": "v1", "timeout": 30}}'
        result = DocumentProcessor.process_config_file(json_data, "config.json")
        
        assert "api" in result["parsed_data"]
        assert result["parsed_data"]["api"]["version"] == "v1"
